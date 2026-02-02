const router = require("express").Router();

const ROADMAPS = {
  "Software Engineer": {
    sections: [
      {
        title: "Web Fundamentals",
        items: [
          {
            id: "html",
            title: "HTML & CSS",
            description: "Learn structure and styling of web pages",
            status: "not-started",
            resources: [
              { id: "html1", title: "HTML Crash Course - Traversy", url: "https://www.youtube.com/watch?v=UB1O30fR-EE", type: "video" },
              { id: "html2", title: "MDN HTML Docs", url: "https://developer.mozilla.org/en-US/docs/Web/HTML", type: "documentation" }
            ],
            completedResources: []
          },
          {
            id: "js",
            title: "JavaScript",
            description: "Core JS concepts",
            status: "not-started",
            resources: [
              { id: "js1", title: "JS Full Course - freeCodeCamp", url: "https://www.youtube.com/watch?v=PkZNo7MFNFg", type: "video" },
              { id: "js2", title: "JavaScript.info", url: "https://javascript.info", type: "documentation" }
            ],
            completedResources: []
          }
        ]
      },
      {
        title: "Backend Fundamentals",
        items: [
          {
            id: "node",
            title: "Node.js & Express",
            description: "Learn server-side JavaScript",
            status: "not-started",
            resources: [
              { id: "node1", title: "Node.js Crash Course - Traversy", url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4", type: "video" },
              { id: "node2", title: "Express Docs", url: "https://expressjs.com/en/starter/installing.html", type: "documentation" }
            ],
            completedResources: []
          }
        ]
      }
    ]
  },
  "Data Scientist": {
    sections: [
      {
        title: "Python & Data Analysis",
        items: [
          {
            id: "python",
            title: "Python Programming",
            description: "Learn Python for data analysis",
            status: "not-started",
            resources: [
              { id: "py1", title: "Python Full Course - freeCodeCamp", url: "https://www.youtube.com/watch?v=rfscVS0vtbw", type: "video" },
              { id: "py2", title: "Python Docs", url: "https://docs.python.org/3/", type: "documentation" }
            ],
            completedResources: []
          },
          {
            id: "pandas",
            title: "Pandas & NumPy",
            description: "Data manipulation and analysis",
            status: "not-started",
            resources: [
              { id: "pd1", title: "Pandas Tutorial - freeCodeCamp", url: "https://www.youtube.com/watch?v=vmEHCJofslg", type: "video" },
              { id: "pd2", title: "NumPy Docs", url: "https://numpy.org/doc/", type: "documentation" }
            ],
            completedResources: []
          }
        ]
      }
    ]
  },
  "ML Engineer": {
    sections: [
      {
        title: "Machine Learning Basics",
        items: [
          {
            id: "ml1",
            title: "ML Fundamentals",
            description: "Introduction to Machine Learning concepts",
            status: "not-started",
            resources: [
              { id: "mlvid1", title: "Machine Learning Crash Course - Google", url: "https://developers.google.com/machine-learning/crash-course", type: "video" },
              { id: "mldoc1", title: "Scikit-Learn Docs", url: "https://scikit-learn.org/stable/documentation.html", type: "documentation" }
            ],
            completedResources: []
          },
          {
            id: "dl1",
            title: "Deep Learning Basics",
            description: "Learn neural networks and deep learning",
            status: "not-started",
            resources: [
              { id: "dlvid1", title: "Deep Learning Specialization - Coursera", url: "https://www.coursera.org/specializations/deep-learning", type: "video" },
              { id: "dldoc1", title: "TensorFlow Docs", url: "https://www.tensorflow.org/learn", type: "documentation" }
            ],
            completedResources: []
          }
        ]
      }
    ]
  }
};

router.get("/:role", (req, res) => {
  const role = req.params.role;
  const roadmap = ROADMAPS[role];

  if (!roadmap) {
    return res.status(404).json({ message: "Roadmap not found for this role" });
  }

  res.json(roadmap);
});

module.exports = router;
module.exports.ROADMAPS = ROADMAPS;
