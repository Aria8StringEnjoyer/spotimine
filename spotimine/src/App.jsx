import { useState } from 'react';
import { useEffect } from 'react';  
import { useRef } from 'react'; 

import { DropdownMenu } from './Components/DropdownMenu';
import './App.css';


export default function App() {   
  let searchTimer
  let trackName;
  let [currentSong, setCurrentSong] = useState(null);
  const volumeBar = useRef(0.125)
  const durationBar = useRef(0);
  const songDuration = useRef(0); 

  //precautions if stolen so stored in client for simplicity's sake
  const APIKey = `AIzaSyCsTjQ6MBfDoih7QW-9guBZRrac3_jD4tY`;
  let isMuted = false;
  let previousVolume = null;
  function setDuration(e) {
    currentSong.currentTime = (e.pageX - e.target.offsetLeft) / e.target.offsetWidth  * currentSong.duration;
    console.log(durationBar)
    durationBar.current.value = currentSong.currentTime; //note to self: audio.currentTime is a base audio attribute, not something that i have created.
    return 
  }

  function setVolume(e) {
    currentSong.volume = e.target.value / 100; //volumeBar range is 0-100 for smoothness, while audio.volume is 0.00-1.
    previousVolume = e.target.value;  
  }

  function toggleMute(e) {
    isMuted = !isMuted;
    e.target.dataset.muted = isMuted;
    currentSong.muted = isMuted;
  } 

  function togglePause (e) {
    let bigButton = document.getElementById("bigPlayButton");

    //e.target can be either one of small numbered buttons or the only big button
    //if pressed small button, check if current track is the same as previous track. If not, switch tracks
    if (e.target != bigButton) {
      let audioElement = document.getElementById(e.target.id[0] + "Audio");

      //switching tracks
      if (audioElement != currentSong) {
        const currentPlayButton = document.getElementById(`${currentSong.id[0]}Play`);
        currentPlayButton.dataset.paused = "true";
        currentSong.pause(); 

        setCurrentSong(audioElement);
        currentSong = audioElement;
      }
    }
    let smallButton = document.getElementById(currentSong.id[0] + "Play");
    
    if (currentSong.paused) {
      bigButton.dataset.paused = "false";
      smallButton.dataset.paused = "false"
      currentSong.play();
    }
    else {
      bigButton.dataset.paused = "true";
      smallButton.dataset.paused = "true";
      currentSong.pause();
    }
  }

  function inputChange(e) {
    clearTimeout(searchTimer)
    searchTimer = setTimeout( () => {
      trackName = e.target.value
      find_track();
    }, 750)
  }

  function Track({ el, id, sound, imageId }) {
    return (
      <>
        <li
         id={ `${ id }Li` }
        >
          <div className="audioDiv">
            <span className="audioSpan"> { id + 1 } </span>
            <button
              data-paused="true"
              id={ `${id}Play` }
              background="src/assets/Play.png"
              onClick={ togglePause }
              className="playButton"
            ></button>

            <audio 
              onTimeUpdate={ e => { 
                let i = document.getElementById("songCurrentTime")
                let seconds = Math.floor(durationBar.current.value % 60);
                let minutes = Math.floor(durationBar.current.value / 60); 

                durationBar.current.max = e.target.duration;
                durationBar.current.value = e.target.currentTime;
                let secondsMax = Math.floor(durationBar.current.max % 60); 
                let minutesMax = Math.floor(durationBar.current.max / 60);

                i.innerText = `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;                                       //display duration in min:sec format
                songDuration.current.innerText = `${minutesMax}:${secondsMax < 10 ? "0" + secondsMax : secondsMax}`;        //display maximum duration is min:sec format

              } }
              onLoadedData={ e => {
                setCurrentSong(e.target);       //set last loaded song as the one currently chosen
                console.log(currentSong)
                currentSong = e.target
                let songDurationListView = document.getElementById(id + "songDurationList")
            
                durationBar.current.max = e.target.duration;
                durationBar.current.value = "0";
                let seconds = Math.floor(durationBar.current.max % 60)
                let minutes = Math.floor(durationBar.current.max / 60)
                let duration = `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`

                songDuration.current.innerText = duration
                songDurationListView.innerText = duration
                volumeBar.current.value =  previousVolume ? previousVolume : 15
                e.target.volume = volumeBar.current.value / 100
              } }

                id={ `${id}Audio` }
                src= { sound.src }
                className="trackAudio"
                type="audio/mp3"
              >
            </audio>

            <img className="albumCover"
              src = { `https://www.googleapis.com/drive/v3/files/${imageId}?alt=media&key=${APIKey}` }
            >
            </img>

            <div style={ {
              display: "grid",  
              padding: "1.5dvh",
            } }>
              <span className="songName">
                { el.song_name }
              </span>
                
              <b className="artistName">  
                { el.artist }
              </b>
            </div>

            <i id={ `${ id }songDurationList` } style={{margin: "3dvh"}}>
            </i>
          </div>
        </li> 
      </>
    )
  }

  async function find_track() {
    try {   
      async function createTrack(el, id) {
          let sound;
          const fileId = el.song_link.match(/\/d\/(.*?)\/view/)?.[1];
          const imageId = el.image_link.match(/\/d\/(.*?)\/view/)?.[1];

          sound = new Audio(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${APIKey}`);
          return (<> <Track el={ el } id={ id } sound={ sound } imageId={ imageId } /> </>);  
      }
      

      async function get_tracks() {
        const res = await fetch("/track?text=" + trackName);
        const queryResults = await res.json();  //getting track info from database 
        const tracks = [];
        for (let i = 0; i < queryResults.length; i++) {
          const el = queryResults[i];
          const track = createTrack(el, i);
          tracks.push(track);
        }
        setTrackList(tracks);
      }

      get_tracks()

    } catch (error) {
      console.log("error:   " + error)
    }
  } 

  const [trackList, setTrackList] = useState( 
    <>
      <Track id="0" sound={ new Audio("songs/Kascade.mp3") } el={{
        song_name: "Kascade", 
        song_path: "some path", 
        song_link: "foo", 
        image_link: "bar", 
        artist: "Animals as Leaders", 
        from_album: "The Joy of Motion"
      }}/>
    </>
  )

  return (
    <>
      <h1 id='header'>Spotimine</h1>

      <DropdownMenu />

      <search id="input_search">
          <input 
          type="text"
          name="text" 
          placeholder=" What are you looking for?"
          onChange={ inputChange } 
          />
      </search>

      <div style={ {display: "flex", justifyContent: "center", marginRight: "8dvw"} }>
        Search results:
      </div>

      <section id="trackSection">
        <ol style={{
          listStyle: "none",
          display: "block flex",
          flexDirection: "column",
          padding: "5px",
          margin: "5px"
        }}>
          { trackList }
        </ol>
      </section>

      <div id="volumeDiv"> 
        <button
          data-muted="false"
          id="Mute"
          onClick={ toggleMute }
          className="muteButton"
        ></button>

          <input 
          className="audioVolume"
          onChange={ setVolume } 
          id="volumeInput" 
          ref={ volumeBar }
          type="range" 
          min="0" 
          max="100"/>
      </div>

      <div>
   
      </div>

      <footer>
        <i
        style = { {   
          position: "absolute",
          marginRight: "35dvw"
        } } 
        id="songCurrentTime">
          0:00  
        </i>

        <button
          data-paused="true"
          id="bigPlayButton"
          background="src/assets/BigPlay.png"
          onClick={ togglePause }
        ></button>

        <input 
          style = { { width: "27.5dvw" } }
          type="range"
          onClick={ setDuration } 
          ref={ durationBar }
          id="durationBar"
        />

        <i ref={ songDuration } id="songDuration" style=  { { 
          position: "absolute", 
          marginLeft: "25dvw"
          } }>
          9999
        </i>
      </footer>
    </>
   )
}


