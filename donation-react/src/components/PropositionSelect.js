import React, {Fragment} from 'react'

const  PropsitionSelect = ({id, nomProposition, description, montant,Onvalider})=>{
    return(
       <Fragment>
          <h2>#{id} {nomProposition}</h2>
          <p>{description}</p>
          <p>{montant}</p>
          <button onClick={Onvalider}>Voter</button>
       </Fragment>
    )
}
export default PropsitionSelect

// <div className="vote">
// <h2>#{p.id} {p.nomProposition}</h2>
// <p>{p.description}</p>
// <p>Montant : {p.montant} ETH</p>
// <button onClick={this.voterProposition(p)}>Voter</button>
//  {/* {this.createProposition(p)} */}
 
// </div>

/***
 * import React, { Component,Fragment }from 'react';
const Membre =({nom,age, children,cacherNom,changerNom})=>{
    return (
        <Fragment>
             <input type="text" value={nom} onChange={changerNom}/>
             <h2>{nom} age: {age}</h2>
             <button onClick={cacherNom}>x</button>
             <p>{children}</p>
        </Fragment>
       )
}
export default Membre;
    
 */