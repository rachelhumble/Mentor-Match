// const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../models");
const moment = require("moment");
const MarkdownIt = require("markdown-it");
md = new MarkdownIt();

db.Question.sync();
//HTML route for main page
router.get("/", (req, res) => {
  const query = {};
  if (req.query.UserId) {
    query.UserId = req.query.UserId;
  }
  //Finding all questions
  db.Question.findAll({
    where: query,
    order: [["id", "DESC"]],
    include: [
      {
        model: db.User
      },
      {
        model: db.Answer,
        include: [db.User]
      }
    ]
  }).then(data => {
    // data.reverse();
    const newData = data.map(d => {
      const newDT = moment(d.updatedAt).format("MM/DD/YYYY hh:mm:ssA");
      const newAnswers = d.Answers.map(a => {
        const newAnswerDT = moment(a.updatedAt).format("MM/DD/YYYY hh:mm:ssA");
        //mapping Answers array with updated date
        return {
          id: a.id,
          answerText: md.render(a.answerText),
          answerTag: a.answerTag,
          dateTime: newAnswerDT,
          rawTime: a.updatedAt,
          answerUsername: a.User.username,
          // username: d.User.username,
          answerUserId: a.User.id,
          questionId: d.id
        };
      });
      //Mapping questions array with updated Answers and date
      return {
        id: d.id,
        questionText: md.render(d.questionText),
        questionTag: d.questionTag,
        rawTime: d.updatedAt,
        dateTime: newDT,
        User: d.User,
        username: d.User.username,
        userId: d.User.id,
        Answers: newAnswers
      };
    });
    res.render("index", { questions: newData });
  });
});

//HTML route on click question tag in navbar
router.get("/question/:questionTag?", (req, res) => {
  const query = {};
  if (req.query.questionTag) {
    query.questionTag = req.query.questionTag;
  }
  db.Question.findAll({
    where: { questionTag: req.params.questionTag },
    order: [["id", "DESC"]],
    include: [
      {
        model: db.User
      },
      {
        model: db.Answer,
        include: [db.User]
      }
    ]
  }).then(data => {
    const newQTData = data.map(d => {
      const newDT = moment(d.updatedAt).format("MM/DD/YYYY hh:mm:ssA");
      //mapping Answers array with updated date
      const newAnswers = d.Answers.map(a => {
        const newAnswerDT = moment(a.updatedAt).format("MM/DD/YYYY hh:mm:ssA");
        //Mapping questions array with updated Answers and date
        return {
          id: a.id,
          answerText: md.render(a.answerText),
          answerTag: a.answerTag,
          dateTime: newAnswerDT,
          rawTime: a.updatedAt,
          answerUsername: a.User.username,
          answerUserId: a.User.id,
          questionId: d.id
        };
      });

      return {
        id: d.id,
        questionText: md.render(d.questionText),
        questionTag: d.questionTag,
        dateTime: newDT,
        rawTime: d.updatedAt,
        User: d.User,
        username: d.User.username,
        userId: d.User.id,
        Answers: newAnswers
      };
    });
    res.render("tags", { questions: newQTData });
  });
});

//-----------------------------API routes for CRUD operations----------------------------

router.get("/api/questions", (req, res) => {
  const query = {};
  if (req.query.UserId) {
    query.UserId = req.query.UserId;
  }
  db.Question.findAll({
    where: query,
    order: [["id", "DESC"]],
    include: [
      {
        model: db.User
      },
      {
        model: db.Answer,
        include: [db.User]
      }
    ]
  }).then(data => {
    const newData = data.map(d => {
      const newDT = moment(d.updatedAt).format("MM/DD/YYYY hh:mm:ssA");

      const newAnswers = d.Answers.map(a => {
        const newAnswerDT = moment(a.updatedAt).format("MM/DD/YYYY hh:mm:ssA");
        //Mapping answers array with updated date
        return {
          id: a.id,
          answerText: a.answerText,
          answerTag: a.answerTag,
          dateTime: newAnswerDT,
          answerUsername: a.User.username
        };
      });
      //Mapping questions array with updated Answers and date
      return {
        id: d.id,
        questionText: d.questionText,
        questionTag: d.questionTag,
        dateTime: newDT,
        User: d.User,
        Answers: newAnswers
      };
    });
    res.json(newData);
  });
});

router.get("/api/questions/:id?", (req, res) => {
  if (req.params.id) {
    db.Question.findOne({
      where: { id: req.params.id },
      raw: true
    })
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        console.log(err);
        status(500).end();
      });
  } else {
    db.Question.findAll({ raw: true }).then(data => {
      res.json(data);
    });
  }
});

router.post("/api/questions", (req, res) => {
  const newQ = {
    questionText: req.body.questionText,
    questionTag: req.body.questionTag,
    UserId: req.body.UserId,
    date: req.body.date
  };

  db.Question.create(newQ)
    .then(data => {
      res.status(200).end();
      console.log(data);
    })
    .catch(err => {
      console.log(err);
      res.status(500).end();
    });
});

router.put("/api/questions/:id", (req, res) => {
  const updQ = {
    questionText: req.body.questionText,
    questionTag: req.body.questionTag,
    userId: req.body.userId,
    date: req.body.date
  };
  db.Question.update(updQ, {
    where: { id: req.params.id }
  })
    .then(function(data) {
      res.status(200).end();
      console.log(data);
    })
    .catch(err => {
      console.log(err);
      res.status(500).end();
      console.log(data);
    });
});

router.delete("/api/questions/:id", (req, res) => {
  db.Question.destroy({
    where: {
      id: req.params.id
    }
    // where: {
    //   userId: req.params.userId
    // }
  })
    .then(function(data) {
      res.status(200).end();
      console.log(data);
    })
    .catch(err => {
      console.log(err);
      res.status(500).end();
    });
});

//----questionTag route (question without s here)--------

router.get("/api/question", (req, res) => {
  const query = {};
  if (req.query.UserId) {
    query.UserId = req.query.UserId;
  }
  db.Question.findAll({
    where: query,
    order: [["id", "DESC"]],
    include: [db.User, db.Answer]
  }).then(data => {
    const newData = data.map(d => {
      const newDT = moment(d.updatedAt).format("MM/DD/YYYY hh:mm:ssA");

      const newAnswers = d.Answers.map(a => {
        const newAnswerDT = moment(a.updatedAt).format("MM/DD/YYYY hh:mm:ssA");

        return {
          id: a.id,
          answerText: a.answerText,
          answerTag: a.answerTag,
          dateTime: newAnswerDT,
          rawTime: a.updatedAt,
          answerUsername: a.User.username
        };
      });

      return {
        id: d.id,
        questionText: d.questionText,
        questionTag: d.questionTag,
        dateTime: newDT,
        rawTime: d.updatedAt,
        User: d.User,
        Answers: newAnswers
      };
    });
    res.json(newData);
  });
});

router.get("/api/question/:questionTag?", (req, res) => {
  const query = {};
  if (req.query.questionTag) {
    query.questionTag = req.query.questionTag;
  }
  db.Question.findAll({
    where: query,
    include: [
      {
        model: db.User
      },
      {
        model: db.Answer,
        include: [db.User]
      }
    ]
  }).then(data => {
    const newData = data.map(d => {
      const newDT = moment(d.updatedAt).format("MM/DD/YYYY hh:mm:ssA");
      const newAnswers = d.Answers.map(a => {
        const newAnswerDT = moment(a.updatedAt).format("MM/DD/YYYY hh:mm:ssA");

        return {
          id: a.id,
          answerText: a.answerText,
          answerTag: a.answerTag,
          dateTime: newAnswerDT,
          rawTime: a.updatedAt,
          answerUserId: a.User.id,
          answerUsername: a.User.username
        };
      });

      return {
        id: d.id,
        questionText: d.questionText,
        questionTag: d.questionTag,
        dateTime: newDT,
        rawTime: d.updatedAt,
        User: d.User,
        username: d.User.username,
        userId: d.User.id,
        Answers: newAnswers
      };
    });
    res.json(newData);
  });
});

//---member
router.get("/member/:UserId?", (req, res) => {
  const query = {};
  if (req.query.UserId) {
    query.UserId = req.query.UserId;
  }
  db.Question.findAll({
    where: { UserId: req.params.UserId },
    order: [["id", "DESC"]],
    include: [
      {
        model: db.User
      },
      {
        model: db.Answer,
        include: [db.User]
      }
    ]
  }).then(data => {
    const newQTData = data.map(d => {
      const newDT = moment(d.updatedAt).format("MM/DD/YYYY hh:mm:ssA");

      const newAnswers = d.Answers.map(a => {
        const newAnswerDT = moment(a.updatedAt).format("MM/DD/YYYY hh:mm:ssA");

        return {
          id: a.id,
          answerText: md.render(a.answerText),
          answerTag: a.answerTag,
          dateTime: newAnswerDT,
          rawTime: a.updatedAt,
          answerUsername: a.User.username,
          answerUserId: a.User.id,
          questionId: d.id
        };
      });

      return {
        id: d.id,
        questionText: md.render(d.questionText),
        questionTag: d.questionTag,
        dateTime: newDT,
        rawTime: d.updatedAt,
        User: d.User,
        username: d.User.username,
        userId: d.User.id,
        Answers: newAnswers
      };
    });
    res.render("profile", { questions: newQTData });
  });
});

module.exports = router;
