import React, { Component } from "react";
import { ToastContainer } from "react-toastify";
import http from "./services/httpService";
import config from "./config.json";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

class App extends Component {
  state = {
    posts: []
  };

  backupPosts = [];

  //apiEndpoint = "https://jsonplaceholder.typicode.com/posts"; Not needed. Get it from config.json

  constructor() {
    super();
    this.backupPosts = [...this.state.posts];
  }

  async componentDidMount() {
    //let promise = axios.get(this.apiEndpoint); // promise is object that promise to wait for coming response from server
    // promise status turn from pending to resolved. It has internal properties shown in [[]]
    // that show status and have data in it. we can also use promise.then
    // But there is another feature of JS i.e await so we can replace same code as:
    const promise = http.get(config.apiEndpoint);
    const response = await promise; // returns response when response comes to promise
    // to apply await we need to make asynchronous. We do by adding async prefix function name
    let posts = response.data;
    this.backupPosts = [...posts];
    this.setState({ posts });
  }

  handleAdd = async () => {
    const obj = { title: "a", body: "b" };
    const response = await http.post(config.apiEndpoint, obj);
    let newPosts = [response.data, ...this.state.posts];
    this.setState({ posts: newPosts });
  };

  handleUpdate = async post => {
    post.title = "UPDATED";
    await http.put(config.apiEndpoint + "/" + post.id, post); // with put we need to pass whole object
    //axios.patch(this.apiEndpoint + "/" + post.id, {title: post.title}); // with patch we just need to pass 1 or more property that need to be updated
    let posts = [...this.state.posts];
    let index = posts.indexOf(post);
    posts[index] = { ...post };
    this.setState({ posts });
  };

  handleDelete = async post => {
    // Pessimistic Update wehre we wait for response from server before updating UI
    // This approach may seem slower and make application look slower.
    // To fasten it we need to update UI and make request later for server, if error
    // comes in server, then we need to revert the UI, this is known as Optimistic Update
    // await axios.delete(this.apiEndpoint + "" + post.id);
    // let posts = [...this.state.posts];
    // let index = posts.indexOf(post);
    // posts.splice(index, 1);
    // this.setState({ posts });
    let posts = [...this.state.posts];
    let index = posts.indexOf(post);
    posts.splice(index, 1);
    this.setState({ posts });
    try {
      console.log("Deleting Post with id: " + post.id + "....");
      await http.delete("s" + config.apiEndpoint + "/" + post.id);
      this.backupPosts = [...posts];
      console.log("Deleting Post with id: " + post.id + " completed");
    } catch (e) {
      //console.log(e);
      // console.log(e.response);
      // if (e.response && e.response.status === 404) {
      //   // when id provided will be wrong
      //   console.log("Expected error occur");
      // } else {
      //   // In this case response will be undefined and occur when url is wrong
      //   console.log("Unexpected error occur");
      // }
      this.setState({ posts: this.backupPosts });
    }
  };

  render() {
    return (
      <React.Fragment>
        <ToastContainer />
        <button className="btn btn-primary" onClick={this.handleAdd}>
          Add
        </button>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {this.state.posts.map(post => (
              <tr key={post.id}>
                <td>{post.title}</td>
                <td>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => this.handleUpdate(post)}
                  >
                    Update
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => this.handleDelete(post)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </React.Fragment>
    );
  }
}

export default App;
