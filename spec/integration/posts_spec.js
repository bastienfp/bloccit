const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics";
const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;

describe("routes: posts", () => {

  beforeEach((done) => {
    this.topic;
    this.post;
    this.user;

    sequelize.sync({force: true}).then((res) => {

      User.create({
        email: "starman@tesla.com",
        password: "Trekkie4lyfe"
      })
      .then((user) => {
        this.user = user;
        Topic.create({
          title: "Winter Games",
          description: "Post your Winter Games stories",
          posts: [{
            title: "Snowball Fighting",
            body: "So much snow!",
            userId: this.user.id
          }]
        },
        {
          include: {
            model: Post,
            as: "posts"
          }
        })
        .then((topic) => {
          this.topic = topic;
          this.post = topic.posts[0];
          done();
        });
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });
  });

  describe("guest user performing CRUD actions for Post", () => {
    describe("GET /topics/:topicId/posts/new", () => {
      it("should not render a new post form", (done) => {
        request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).not.toContain("New Post");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/create", () => {
      it("should not create a new post", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/create`,
          form: {
            title: "Watching snow melt",
            body: "Without a doubt my favorite thing to do besides watching paint dry!"
          }
        };
        request.post(options, (err, res, body) => {
          Post.findOne({where: {title: "Watching snow melt"}})
          .then((post) => {
            expect(post).toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });

    describe("GET /topics/:topicId/posts/:id", () => {
      it("should render a view with the selected post", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Snowball Fighting");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/destroy", () => {
      it("should not delete the post with the associated ID", (done) => {
        expect(this.post.id).toBe(1);
        request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {
          Post.findByPk(1)
          .then((post) => {
            expect(post).not.toBeNull();
            expect(err).toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });

    describe("GET /topics/:topicId/posts/:id/edit", () => {
      it("should not render a view with an edit post form", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).not.toContain("Edit Post");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/update", () => {
      it("should not update the post with the given values", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
          form: {
            title: "Snowman Building Competition",
            body: "I love wathcing them melt slowly"
          }
        };
        request.post( options, (err, res, body) => {
          expect(err).toBeNull();
          Post.findByPk(this.post.id)
          .then((post) => {
            expect(post.title).toBe("Snowball Fighting");
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });
  });

  describe("member user performing CRUD actions for Post", () => {
    beforeEach((done) => {
      this.secondUser;
      this.secondPost;

      User.create({
        email: "member@test.com",
        password: "memberpwd"
      })
      .then((secondUser) => {
        this.secondUser = secondUser;
        Post.create({
          title: "Post #2",
          body: "Body for the second post",
          topicId: this.topic.id,
          userId: this.secondUser.id
        })
        .then((post) => {
          this.secondPost = post;
        });
        request.get({
          url: "http://localhost:3000/auth/fake",
          form: {
            role: this.secondUser.role,
            userId: this.secondUser.id,
            email: this.secondUser.email
          }
        }, (err, res, body) => {
          done();
        });
      })
      .catch((err) => {
        console.log(err);
        done();
      })
    });

    describe("GET /topics/:topicId/posts/new", () => {
      it("should render a new post form", (done) => {
        request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("New Post");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/create", () => {
      it("should create a new post and redirect", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/create`,
          form: {
            title: "Watching snow melt",
            body: "Without a doubt my favorite thing to do besides watching paint dry!"
          }
        };
        request.post(options, (err, res, body) => {
          Post.findOne({where: {title: "Watching snow melt"}})
          .then((post) => {
            expect(post).not.toBeNull();
            expect(post.title).toBe("Watching snow melt");
            expect(post.body).toBe("Without a doubt my favorite thing to do besides watching paint dry!");
            expect(post.topicId).toBe(this.topic.id);
            expect(post.topicId).not.toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });

      it("should not create a new post that fails validations", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/create`,
          form: {
            title: "a",
            body: "b"
          }
        };
        request.post(options, (err, res, body) => {
          Post.findOne({where: {title: "a"}})
          .then((post) => {
            expect(post).toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });

    describe("GET /topics/:topicId/posts/:id", () => {
      it("should render a view with the selected post", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Snowball Fighting");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/destroy", () => {
      it("should not delete the post with the associated ID if the user is not the associated owner of the post", (done) => {
        expect(this.post.id).toBe(1);
        request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {
          Post.findByPk(1)
          .then((post) => {
            expect(post).not.toBeNull();
            expect(err).toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });

      it("should delete the post with the associated ID if the user is the associated owner of the post", (done) => {
        expect(this.secondPost.id).toBe(2);
        request.post(`${base}/${this.topic.id}/posts/${this.secondPost.id}/destroy`, (err, res, body) => {
          Post.findByPk(2)
          .then((post) => {
            expect(post).toBeNull();
            expect(err).toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });

    describe("GET /topics/:topicId/posts/:id/edit", () => {
      it("should not render a view with an edit post form if the user is not the associated owner of the post", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).not.toContain("Edit Post");
          done();
        });
      });

      it("should render a view with an edit post form if the user is the associated owner of the post", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.secondPost.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Edit Post");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/update", () => {
      it("should return a status code 302 if the user is the associated owner of the post", (done) => {
        request.post({
          url: `${base}/${this.topic.id}/posts/${this.secondPost.id}/update`,
          form: {
            title: "Post #2 updated title!",
            body: "Post #2 updated body!"
          }
        }, (err, res, body) => {
          expect(res.statusCode).toBe(302);
          done();
        });
      });

      it("should update the post with the given values if the user is the associated owner of the post", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/${this.secondPost.id}/update`,
          form: {
            title: "Post #2 updated title!",
            body: "This is so we can pass our validation"
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          Post.findOne({
            where: {id: this.secondPost.id}
          })
          .then((post) => {
            expect(post.title).toBe("Post #2 updated title!");
            expect(post.body).toBe("This is so we can pass our validation");
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });

      it("should not update the post with the given values if the user is not the associated owner of the post", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
          form: {
            title: "Post #2 updated title!",
            body: "This is so we can pass our validation"
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          Post.findOne({
            where: {id: this.post.id}
          })
          .then((post) => {
            expect(post.title).toBe("Snowball Fighting");
            expect(post.body).toBe("So much snow!");
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });
  });

  describe("admin user performing CRUD actions for Post", () => {
    beforeEach((done) => {
      User.create({
        email: "admin@example.com",
        password: "123456",
        role: "admin"
      })
      .then((user) => {
        request.get({  //mock authentication
          url: "http://localhost:3000/auth/fake",
          form: {
            role: user.role,   //mock authenticate as admin use
            userId: user.id,
            email: user.email
          }
        }, (err, res, body) => {
          done();
        });
      });
    });

    describe("GET /topics/:topicId/posts/new", () => {
      it("should render a new post form", (done) => {
        request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("New Post");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/create", () => {
      it("should create a new post and redirect", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/create`,
          form: {
            title: "Watching snow melt",
            body: "Without a doubt my favorite thing to do besides watching paint dry!"
          }
        };
        request.post(options, (err, res, body) => {
          Post.findOne({where: {title: "Watching snow melt"}})
          .then((post) => {
            expect(post).not.toBeNull();
            expect(post.title).toBe("Watching snow melt");
            expect(post.body).toBe("Without a doubt my favorite thing to do besides watching paint dry!");
            expect(post.topicId).toBe(this.topic.id);
            expect(post.topicId).not.toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });

      it("should not create a new post that fails validations", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/create`,
          form: {
            title: "a",
            body: "b"
          }
        };
        request.post(options, (err, res, body) => {
          Post.findOne({where: {title: "a"}})
          .then((post) => {
            expect(post).toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });

    describe("GET /topics/:topicId/posts/:id", () => {
      it("should render a view with the selected post", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Snowball Fighting");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/destroy", () => {
      it("should delete the post with the associated ID", (done) => {
        expect(this.post.id).toBe(1);
        request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {
          Post.findByPk(1)
          .then((post) => {
            expect(post).toBeNull();
            expect(err).toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });

    describe("GET /topics/:topicId/posts/:id/edit", () => {
      it("should render a view with an edit post form", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Edit Post");
          expect(body).toContain("Snowball Fighting");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/update", () => {
      it("should return a status code 302", (done) => {
        request.post({
          url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
          form: {
            title: "Snowman Building Competition",
            body: "I love wathcing them melt slowly"
          }
        }, (err, res, body) => {
          expect(res.statusCode).toBe(302);
          done();
        });
      });

      it("should update the post with the given values", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
          form: {
            title: "Snowman Building Competition",
            body: "This is so we can pass our validation"
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          Post.findOne({
            where: {id: this.post.id}
          })
          .then((post) => {
            expect(post.title).toBe("Snowman Building Competition");
            expect(post.body).toBe("This is so we can pass our validation");
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });
  });

});
