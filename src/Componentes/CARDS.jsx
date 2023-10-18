import { useEffect,useState } from 'react';
import './CARDS.css'
function shuffle(array) {
  var index = array.length;
  var number = 0;
  var temp;

  while (index--) {
      number = Math.floor(Math.random() * (index+1));
      temp = array[index];
      array[index] = array[number];
      array[number] = temp;
  }
  return array;
}

const cantidad=shuffle(['✔','🙌','💖',"🐱‍🐉",'👌','🌹','🤢','😍','🎶','🍤','✔','🙌','💖',"🐱‍🐉",'👌','🌹','🤢','😍','🎶','🍤'])
const CARDS = () => {

  const [point,setpoint] =useState(0)
  const [error,seterror] =useState(0)


  useEffect(()=>{
    if(point>=1000){
      document.location.reload();
    }
},[point])

  var ultimo =undefined
  var moviendo = false

  function hola(event) {
    if (moviendo == true) return
    
   var id = event.target.parentElement.id;
   var card=document.getElementById(id)
   var par = card.querySelector('.dentro').innerHTML

   if (card.classList.contains('correct'))return 

   if(ultimo==undefined){
    ultimo={
      card:card,
      par: par
    }
    card.classList.add('mostrar')
    return
   }
   if (ultimo.card==card) return;
   
   card.classList.add('mostrar')
   if(ultimo.par==par){
    ultimo.card.classList.add('correct')
    card.classList.add('correct')
    setpoint(point+100)
    ultimo=undefined

   }else{
    moviendo = true
      setTimeout(()=>{
        ultimo.card.classList.remove('mostrar')
        card.classList.remove('mostrar')
        seterror(error+1)
        moviendo = false
     },500)
    
   }


   

 }


 return (
     <>
     <div className='puntaje'> <p>POINT:{point} </p>     <p>ERROR:{error} </p> </div>
     
   
      <div className='cuadros' >
    
       
     {cantidad.map((info, index)=>(
       <div key={index} id={index} className='cuadro' onClick={hola} >

         <div  className='dentro'>
           {info}
        </div>
         <div className=' cara blanco'>
         </div>
       </div>
       
       
   ))}  
   </div>

     
     
     </>
      
      
   
     
  
)}

export default CARDS