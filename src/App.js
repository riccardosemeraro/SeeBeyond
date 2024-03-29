//Nella cartella 'images' ci vanno tutte le immagini usate nel progetto
//Nella cartella 'style' ci vanno tutti i file css usati nel progetto
//Nella cartella 'components' ci vanno tutti i componenti del progetto
//Nella cartella 'functions' ci vanno tutte le funzioni del progetto (si esatto quelle dei cookie ad esempio)
//eventualmente creare le cartelle mancanti
//import NOMEFUNZIONE from 'PATTERNFUNZIONE.js' per importare una funzione specifica
//le 'variabili' passate ai figli si chiamano Props, le variabili definite nei padri si chiamano State
//è consigliato rispettare la nomenclatura HANDLEnome per la funzione padre e ONnome per la funzione figlio

//PROPRIETà DI SEEBEYOND, TUTTI I DIRITTI E USI RISERVATI

//import librerie React
import React, { useState, useEffect } from 'react';

//import componenti, ad ogni componente è associata una pagina
import Home from './components/home.js';
import Info from './components/info.js';
import Maps from './components/maps.js';
import Voice from './components/voice.js';

//import delle immagini, ad ogni immagine è associato un bottone
import InfoImageActive from './images/Info-active.png';
import InfoImageInactive from './images/Info-inactive.png';
import OCRImageActive from './images/Ocr-active.png';
import OCRImageInactive from './images/Ocr-inactive.png';
import MapsImageActive from './images/Maps-active.png';
import MapsImageInactive from './images/Maps-inactive.png';
import VoiceImageActive from './images/Voice-active.png';
import VoiceImageInactive from './images/Voice-inactive.png';
import OnOffImageActive from './images/OnOff-active.png';
import OnOffImageInactive from './images/OnOff-inactive.png';

import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, get, set, update } from "firebase/database";
import { onValue } from "firebase/database";

function App(){
  
  //funzione react, ActivePage è letteralmente la pagina attiva e viene inizializzata a Home
  const [ActivePage, setActivePage] = useState('Home');

  //inizializzo il db
  const firebaseConfig = { databaseURL: "https://seebeyond-8bdb7-default-rtdb.europe-west1.firebasedatabase.app/" };
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  //inizializzo isActive, variabile che tiene traccia dello stato del bottone
  const [isActive, setIsActive] = useState(false);

  //inizializzo nome oggetto e stato lettura oggetto
  const [objectName, setObjectName] = useState('');
  const [objectReading, setObjectReading] = useState(false);

  //inizializzo stato OCR
  const [readTxt, setReadTxt] = useState(false);

  //useEffect è una funzione che viene eseguita al montaggio del componente, in questo caso viene eseguita una sola volta
  //nel caso in cui non si mettesse allora verrebbe eseguita infinite volte
  useEffect(() => {
    onValue(ref(database, 'Impostazioni'), (snapshot) => {
      if (snapshot.val().StatusApp === 'ON') {
        //SetCookie('buttonState', true, 2); //i cookie non sono più necessari, lascio l'istruzione per sfizio
        setIsActive(true); 
      } else {
        //SetCookie('buttonState', false, 2); //i cookie non sono più necessari, lascio l'istruzione per sfizio
        setIsActive(false);
      }
      if (snapshot.val().StatusObjectReading === 'ON') {
        setObjectReading(true);
      } else {
        setObjectReading(false);
      }
    });
  }, []); // L'array vuoto come secondo argomento significa che questo effetto verrà eseguito solo al montaggio del componente
      
  //Vettore di Strutture dati, sono i dati di ogni singolo bottone, aggiungere elementi qua corrisponde ad aggiungere bottoni
  //alla pagina home
  const buttons = [
    { id: 1, name: 'top-left', state: isActive, img_active: InfoImageActive, img_inactive: InfoImageInactive },
    { id: 2, name: 'top-right', state: isActive, img_active: OCRImageActive, img_inactive: OCRImageInactive },
    { id: 3, name: 'bottom-left', state: isActive, img_active: MapsImageActive, img_inactive: MapsImageInactive },
    { id: 4, name: 'bottom-right', state: isActive, img_active: VoiceImageActive, img_inactive: VoiceImageInactive },
    { id: 5, name: 'center', state: objectReading, img_active: OnOffImageActive, img_inactive: OnOffImageInactive },
  ];

  //funzione che cambia lo stato del bottone e usa il TTS per comunicare lo stato
  const handleIsActive = () => {
    setIsActive(!isActive);
    if(isActive){ 
      setObjectReading(false);
      update(ref(database, 'Impostazioni/'), {
        StatusObjectReading : 'OFF'
      });
    }
    let utterance = new SpeechSynthesisUtterance('App ' + (isActive ? 'scollegata' : 'collegata'));
    window.speechSynthesis.speak(utterance);
  }

  //funzione che cambia la pagina attiva
  const handlePage = (page) => {
    setActivePage(page);
    if (page !== 'OCR') {
      let utterance = new SpeechSynthesisUtterance('Pagina ' + page);
      window.speechSynthesis.speak(utterance);
    }
  }

  //funzione che cambia lo stato della lettura degli oggetti e usa il TTS per comunicare lo stato
  const handleStateObjectReading = () => {
    if(isActive){
      setObjectReading(!objectReading);
      console.log(objectReading);
      update(ref(database, 'Impostazioni/'), {
        StatusObjectReading : objectReading ? 'OFF' : 'ON'
      });
      let utterance = new SpeechSynthesisUtterance('Lettura oggetti ' + (objectReading ? 'disattivata' : 'attivata'));
      window.speechSynthesis.speak(utterance);
    }
  }

  //useEffect che viene eseguito ogni 5 secondi, controlla se ci sono oggetti rilevati e se non sono stati letti
  useEffect(() => {
    const dbRef = ref(database);
    const interval = setInterval(() => {
      for (let i = 1; i < 3; i++) {
        get(child(dbRef, ('Oggetti Rilevati/'+i))).then((snapshot) => {
          const data = snapshot.val();
          if(data.read === false) {
            setObjectName('C\'è un '+data.name+" a "+parseInt(data.distance)+" metri");
            update(child(dbRef, ('Oggetti Rilevati/' + i)), {read: true}); // Update 'Read' to true
          }
        }).catch((error) => { console.error(error); });
      }
    }, 5000); // Execute the code every X000 second

    return () => {
      clearInterval(interval); // Clear the interval when the component is unmounted
    };
  }, []);

  //useEffect che viene eseguito ogni volta che cambia lo stato di objectReading,
  //se è attivo e se c'è un oggetto da leggere allora usa il TTS per leggerlo
  useEffect(() => {
    if(isActive && objectReading){
      console.log(objectName);
      let utterance = new SpeechSynthesisUtterance(objectName);
      window.speechSynthesis.speak(utterance);
      setObjectName('');
    }
  }, [isActive, objectName]);

  //useEffect che viene eseguito ogni volta che cambia lo stato di readTxt, se true allora legge il testo rilevato dall'OCR
  useEffect(() => {
    if(readTxt){
      const dbRef = ref(database);
        get(child(dbRef, `Testo Rilevato/Testo`)).then((snapshot) => {
            let utterance = new SpeechSynthesisUtterance(snapshot.val());
            window.speechSynthesis.speak(utterance);
        });
      setReadTxt(false);
    }
  }, [readTxt]);

  //variabile che tiene traccia della pagina attiva
  let activePage;

  //ogni pagina ha un bottone che la richiama, il bottone è associato ad una funzione che cambia la pagina attiva
  switch(ActivePage){
    case 'Home':
      activePage = <Home  //Home è il componente home.js 
        ActivePage={ActivePage} 
        onActivePage={handlePage} 
        buttons={buttons} 
        isActive={isActive}  
        setIsActive={handleIsActive} 
        database={database}
        objectReading={objectReading}
        onStateObjectReading={handleStateObjectReading}
      />;
      break;
    case 'Info':
      activePage = <Info  //Info è il componente info.js
        ActivePage={ActivePage}
        onActivePage={handlePage}
        buttons={buttons}
        isActive={isActive}
        setIsActive={setIsActive}
      />;
      break;
    case 'OCR':
      setReadTxt(!readTxt);
      setActivePage('Home');
      break;
    case 'Maps':
      activePage = <Maps  //Maps è il componente maps.js
        ActivePage={ActivePage}
        onActivePage={handlePage}
        buttons={buttons}
        isActive={isActive}
        setIsActive={setIsActive}
      />;
      break;
    case 'Voice':
      activePage = <Voice  //Voice è il componente voice.js
        ActivePage={ActivePage}
        onActivePage={handlePage}
        buttons={buttons}
        isActive={isActive}
        setIsActive={setIsActive}
      />;
      break;
  }

  return activePage; //ritorna il componente selezionato dallo switch
      
}

export default App;
