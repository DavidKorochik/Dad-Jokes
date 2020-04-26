import React, {Component} from 'react';
import Joke from './Jokes';
import axios from 'axios';
import uuid from 'uuid/v4';
import './JokeList.css';

class JokeList extends Component{
    static defaultProps = {
        numJokesToGet: 10
    };

    constructor(props){
        super(props);
        this.state = {jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"), loading: false};
        this.seenJokes = new Set(this.state.jokes.map(j => j.text));
        this.handleClick = this.handleClick.bind(this);
    }

    handleVote(id, delta){
        this.setState(st => ({
            jokes: st.jokes.map(j => 
                j.id === id ? {...j, votes: j.votes + delta} : j
            )
        }),
        () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
        );
    }

    componentDidMount(){
        if(this.state.jokes.length === 0) this.getJokes();
    }
        async getJokes(){
            try{
        let jokes = [];
        while(jokes.length < this.props.numJokesToGet){
            let res = await axios.get("https://icanhazdadjoke.com/",
            {headers: {Accept: 'application/json'}});
            let newJoke = res.data.joke;
            if(!this.seenJokes.has(newJoke)){
                jokes.push({text: res.data.joke, votes: 0, id: uuid()});
            }
           else{
            console.log("FOUND A DUPLICATE");
            console.log(newJoke);
           }
        }
        this.setState(st => ({
            loading: false,
            jokes: [...st.jokes, ...jokes]
        }),
        () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes)));
        }   catch(e){
                alert(e);
        }
}
       
    handleClick(){
        this.setState({loading: true}, this.getJokes);
    }

    render(){
        if(this.state.loading){
            return(
                <div className="JokeList-spinner">
                    <i className="far fa-8x fa-laugh fa-spin"/>
                    <h1 className="JokeList-title">Loading ...</h1>
                </div>
            );
        }
        let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
        return(
            <div className="JokeList">
                <div className="JokeList-sidebar">
                    <h1 className="JokeList-title"><span>Liora</span> Jokes</h1>
                    <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"/>
                    <button onClick={this.handleClick} className="JokeList-getmore">Fetch Jokes</button>
                </div>
                <div className="JokeList-jokes">
                    {jokes.map(j => (
                        <Joke key={j.id} votes={j.votes} text={j.text} downvote={() => this.handleVote(j.id, -1)} upvote={() => this.handleVote(j.id, 1)}/>
                    ))}
                </div>
            </div>
        )
    }
}

export default JokeList;