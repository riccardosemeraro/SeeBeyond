import React, { Component , useState } from 'react';
import Button from '../components/button';
import '../style/home.css';
//import { GetCookie, SetCookie } from '../functions/cookie.js'; //se ne importo solo una mi da errore
import { getDatabase, ref, child, get, set, update } from "firebase/database";

function Home({ActivePage, onActivePage, buttons, isActive, setIsActive, database, objectReading, onStateObjectReading}){

  //prova db (connessione + lettura)
  /* lettura (disabilitata in quanto utile solo per verifica)
  const dbRef = ref(getDatabase(app));
  get(child(dbRef, `Impostazioni/Status`)).then((snapshot) => {
    if (snapshot.val() === "ON") { console.log(snapshot.val()); }
  }).catch((error) => { console.error(error); }); */
  const writeUserData = (value) => {
    update(ref(database, 'Impostazioni/'), {
      StatusApp : value
    });
  };

  //funzione che cambia lo stato del bottone, richiama la funziona passata come props
  const handleSwitchButtonState = () => {

    //salva valore di accensione nel db
    if((!isActive) === true){
      writeUserData("ON");
    }else{
      writeUserData("OFF");
    }
    setIsActive(!isActive);
  };  

  //funzione che cambia la pagina attiva, richiama la funziona passata come props
  const handleSwitchPage = (buttonID) => { 
    switch(buttonID){
        case 1: //dato che il bottone con ID 1 corrisponde a info, passo la stringa 'info' che verrà setacciata dallo switch in App.js
            onActivePage('Info');
            break;
        case 2: //analogamente al caso precedente
            onActivePage('OCR');
            break;
        case 3: //analogamente al caso precedente
            onActivePage('Maps');
            break;
        case 4: //analogamente al caso precedente
            onActivePage('Voice');
            break;
      }
      
  };

  //ritorna i button passati
  return (
    <>
      <title>SeeBeyond - Guarda Oltre</title>
      {buttons.map((button) => ( //ciclo che richiama il componente button per ogni button passato dall'array di struct
        <Button //richiamo il componente button passando le props necessarie
          buttonID={button.id} 
          buttonName={button.name}
          buttonState={button.state}
          buttonImgActive={button.img_active}
          buttonImgInactive={button.img_inactive}
          onSwitchButtonState={handleSwitchButtonState}
          onSwitchPage={handleSwitchPage}
          objectReading={objectReading}
          onStateObjectReading={onStateObjectReading}
        />
      ))}
    </>
  );
}

export default Home;