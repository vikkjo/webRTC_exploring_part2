import React, { useRef, useEffect } from "react";

import "./App.css";

function App() {

  
  const bob = new RTCPeerConnection();
  const alice = new RTCPeerConnection();

  useEffect(() => {

    bob.onicecandidate = (e) => {
      console.log("bob onice", e);
      if(e.candidate){
        ICEToAlice(e)
      }
    }

    alice.onicecandidate = (e) => {
      console.log("alice onice", e);
      if(e.candidate){
        ICEToBob(e)
      }
    }

    const ICEToAlice = (ICECandidate) => {
      alice.addIceCandidate(new RTCIceCandidate(ICECandidate.candidate))
    }

    const ICEToBob = (ICECandidateEvenet) => {
      bob.addIceCandidate(new RTCIceCandidate(ICECandidateEvenet.candidate))
    }

    alice.ontrack = (medStream) => {
      aliceRemoteVideo.current.srcObject = medStream.streams[0]
    }

    bob.ontrack = (medStream) => {
      bobRemoteVideo.current.srcObject = medStream.streams[0]
    }

  })


  const bobCreateOffer = () => {
    bob.createOffer({offerToReceiveVideo: true})
      .then(rtcSDP => {
        bob.setLocalDescription(rtcSDP)
        offerToAlice(rtcSDP)
      })
  }

  const offerToAlice = (rtcSDP) => {
    console.log("alice got offer", rtcSDP);
    alice.setRemoteDescription(new RTCSessionDescription(rtcSDP))
  }

  const aliceCreateAnswer = () => {
    alice.createAnswer({offerToReceiveVideo: true})
      .then(rtcSDP => {
        alice.setLocalDescription(rtcSDP)
        answerToBob(rtcSDP);
      })
  }

  const answerToBob = (rtcSDP) => {
    console.log("bob got answer", rtcSDP)
    bob.setRemoteDescription(new RTCSessionDescription(rtcSDP))
  }

  const bobGetMedia = () => {
    navigator.mediaDevices
      .getDisplayMedia()
      .then(medStream => {
        bobLocalVideo.current.srcObject = medStream;
        medStream.getTracks().forEach(track => {bob.addTrack(track, medStream)});
      })
      .catch((e) => console.log("Error: ", e))

  }

  const aliceGetMedia = () => {
    navigator.mediaDevices
      .getDisplayMedia()
      .then(medStream => {
        aliceLocalVideo.current.srcObject = medStream;
        medStream.getTracks().forEach(track => alice.addTrack(track, medStream))
      })
      .catch((e) => console.log("Error: ", e))

  }

  const bobLocalVideo = useRef();
  const bobRemoteVideo = useRef();
  const aliceLocalVideo = useRef();
  const aliceRemoteVideo = useRef();

  const videoStyle = {
    width: 256,
    height: 144,
    margin: 5,
    backgroundColor: 'black'
  }

  return (
    <div className="App">
      <h1>WebRTC Media sharing</h1>
      <div className="VideoContainer">
        <video className="Video" style={videoStyle} ref={bobLocalVideo} autoPlay></video>
        <p>Bob local video</p>
      </div>
      <div className="VideoContainer">
        <video className="Video" style={videoStyle} ref={bobRemoteVideo} autoPlay></video>
        <p>Bob remote video</p>
      </div>
      <br/>
      <button onClick={bobGetMedia}>Bob get media</button>
      <button onClick={bobCreateOffer}>Bob offers</button>
      <hr/>
      <div className="VideoContainer">
      <video className="Video" style={videoStyle} ref={aliceLocalVideo} autoPlay></video>
        <p>Alice local video</p>
      </div>
      <div className="VideoContainer">
        <video className="Video" style={videoStyle} ref={aliceRemoteVideo} autoPlay></video>
        <p>Alice remote video</p>
      </div>
      <br/>
      <button onClick={aliceGetMedia}>Alice get media</button>
      <button onClick={aliceCreateAnswer}>Alice answers</button>
    </div>
  );
}

export default App;
