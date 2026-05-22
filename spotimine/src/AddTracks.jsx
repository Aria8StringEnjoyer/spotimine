import { DropdownMenu } from './Components/DropdownMenu';
import { useState } from "react"


export default function AddTracks() {
    const [songName, setSongName] = useState(null)
    const [artist, setArtist] = useState(null)
    const [fromAlbum, setFromAlbum] = useState(null)
    const [audioFile, setAudioFile] = useState(null)
    const [date, setDate] = useState(null)
    const [link, setLink] = useState(null)

    let elements = document.getElementsByClassName("formInput")
    let {inputDate, inputFile, inputSong, inputAlbum, inputArtist, inputLink, inputImage} = elements
    let isDisabled

    function isButtonDisabled() {
        return (fromAlbum && songName && artist && audioFile) ? false : true
        //Fix the bug that causes the button to be disabled
    }

    async function addTrack() {
        try {
            console.log(inputFile.files[0].name)
            let blob = new Blob(inputFile.files, {type: "audio/flac"});
            const reqBody = JSON.stringify({
                song_name: inputSong.value,
                from_album: inputAlbum.value,
                date_created: inputDate.value,
                artist: inputArtist.value,
                song_path: inputFile.files[0].name,
                song_link: inputLink.value,
                image_link: inputImage.value,
            });

            console.log(reqBody)

            const response = await fetch("/track", {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: reqBody

            });
            const result = response.json();
            console.log(response);

        } catch(err) {
            console.log(err)
        }

        return;
    }

    function addTracks() {

    }

    function addAlbum() {

    }


    return (
        <>
            <h1>
                Add tracks
            </h1>
            <DropdownMenu />
            <form id="trackForm" onSubmit={ e => e.preventDefault() }>
                <input onChange={ setDate } className="formInput" id="inputDate" type="date" /> 
                <input onChange={ setAudioFile } className="formInput" id="inputFile" type="file" />

                <div style={ { display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column"} }>
                    <input onChange={ setSongName } className="formInput" placeholder="  song name:" id="inputSong" type="text" />
                    <input onChange={ setFromAlbum } className="formInput" placeholder="  from album/ep:" id="inputAlbum" type="text" />
                    <input onChange={ setArtist } className="formInput" placeholder="  made by artist:" id="inputArtist" type="text" />
                    <input onChange={ setLink } className="formInput" placeholder="  link to file:" id="inputLink" type="text" />
                    <input onChange={ setLink } className="formInput" placeholder="  link to song image:" id="inputImage" type="text" />
                </div>
                
                <button 
                disabled={ isButtonDisabled() }
                onClick={ addTrack }
                className="formInput" 
                id="submitButton">submit</button>
            </form>
        </>
    )
  }