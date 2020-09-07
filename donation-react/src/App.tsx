import React, { Component } from 'react';
import './App.css';
import { abi } from './abi'
import Web3 from 'web3'
import { Contract } from 'web3-eth-contract';
import { Proposition, EtatProposition } from './types'
import Logo from './components/Logo'



interface AppState {
  propositionSelecteds: Array<Proposition>;
  contrat?: Contract;
  compteConnecte?: string;
  input?: string;
  isShow:boolean
}

const ADRESSE_CONTRAT = "0x042bb95C8AC366989FA80dbA6Ee7E8d92BdF445e"
class App extends Component<any, AppState> {

  public readonly state = {
    propositionSelecteds: new Array<Proposition>(),
    contrat: undefined,
    compteConnecte: undefined,
    input: undefined,
    isShow:false

  }

  /***
   * +++++Au chargement de l'application+++++
   */
  public async componentDidMount() {

    Web3.givenProvider.enable();
    const web3 = this.getWeb3();
    const contrat = this.getContrat();

    // Mettre à jour le compte l'utilisateur  l'orqu'il selectionne un nouveau compte sur MetaMask
    web3.givenProvider.publicConfigStore.on('update', () => {
      web3.eth.getAccounts().then(accs => this.setState({ compteConnecte: accs[0] }));
    })

    const propositionSelecteds = new Array<Proposition>()
    const nbPropositions = await contrat.methods.totalPropsitionSelectione().call();

    for (let i = 0; i < nbPropositions; i++) {
      const propsition = await contrat.methods.propositionSelectionIndex(i).call();
      propositionSelecteds.push(this.ParseProsition(propsition))
    }
    this.setState({ contrat, propositionSelecteds })

    //=== Envoie l'etat des des propositions
     this.state.isShow = this.isSelectionne();
    //  console.log(this.state.isShow)

  }

  /**
   * +++++Programme Principal+++++
   */
  public render() {
    let description = null
    const {isShow} = this.state;
     if(isShow){
       description = (

         <div className="voteSelecetion">
           <h2>Les Propositions Selectionnées pour le vote </h2>
           <div className="propsitionSelectionnees">
             {this.renderProppositionVote()}
           </div>


             <div className="btClose">
             <h2>Cloture de Vote</h2>
               <button onClick={this.ClotureVote()}>CLOSE</button>
             </div> 
         </div>
       )
     }else{
       description = (
         <div className="RenderDon">
           <h2>Donation</h2>
           <div className="UnDon">
              {this.renderFaireDon()}
            </div>

         </div>
       )
     }

    return (

      <div className="App">
        <div className="App-header">
          <div className="logo">
            <Logo />
          </div>

          <div className="Account">
            <p>Compte Connecté: {this.state.compteConnecte} </p>
          </div>

        </div>

        <div className="container">
           {description}
        </div>
      </div>

    )
  }

  /**
   * elle permet de Mettre la close de la vote
   */
  private renderCloseVote() {
    return this.state.propositionSelecteds
      .filter(p => p.etat === EtatProposition.Selectionner && p.nbVotes > 0)
      .map((p, index) => (
        <div key={index}>
          
          <div className="PositionVote">
            {
              <div className="vote">
                <h3>#{p.id} {p.nomProposition}</h3>
                <p>#{p.id} {p.description}</p>
                <p>Montant : {p.montant}</p>
              </div>
            }
          </div>
        </div>
      ));
  }

  /**
   * C'est une fonction qui renvoie
   * les propostions selectionnées pour  le vote
   */
  private renderProppositionVote() {
    return this.state.propositionSelecteds
      .filter(p => p.etat === EtatProposition.Selectionner)
      .map((p, index) => (
        <div key={index}>
          {/* {p.nomProposition === this.ajoutImage() ? <div> </div>: ""} */}
          <div className="PostionVote">
            {
              <div className="vote">
                <h3>#{p.id} {p.nomProposition}</h3>
                <p>{p.description}</p>
                <p>Montant: {p.montant} ETH</p>
                <button onClick={this.voterProposition(p)}>VOTER</button>
              </div>
            }
          </div>
        </div>
      ));
  }

  /**
   * elle envoie la proposition
   * qui aura la donation finale
   */
  private renderFaireDon() {
    return this.state.propositionSelecteds
      .filter(p => p.etat === EtatProposition.Valide)
      .map((p, index) => (
        <div key={index}>
          <div className="faireDon">
            <div className="don">
              <h3>#{p.id} {p.nomProposition}</h3>
              <p>{p.description}</p>
              <p>Montant : {p.montant} ETH</p>
              <p>Don Encour : {p.donEnCour} ETH</p>
              <input type="text" onChange={this.handleChange()} placeholder="Saisir un Don" />
              <button onClick={this.faireDon(p)}> JE FAIS UN DON</button>
            </div>
          </div>
        </div>
      ))
  }

  private ajoutImage() : string {
    return "";
  }
  /***
   * elle verifie  si l'etat de la proposition a changé
   */
  
  private isSelectionne(): boolean {
    let isverif = true;
      let i = 0;
      while(i<  this.state.propositionSelecteds.length && isverif){
        
         if(this.state.propositionSelecteds[i].etat !== EtatProposition.Selectionner){
           isverif = false;
         }
         i++;
      }
      return isverif;

   
  }
  /**
   * instanciation de Web3
   *                 
   */
  private getWeb3(): Web3 {
    return (new Web3(Web3.givenProvider || 'http://127.0.0.1:7545'))
  }
  /***
   *  elle renvoit le contrat
   */
  private getContrat(): Contract {
    const web3 = this.getWeb3();
    const contrat = new web3.eth.Contract(abi, ADRESSE_CONTRAT, {})
    return contrat;
  }

  /**
   * Elle permet de convertir l'objet la proposition en Objet*
   * 
   */
  private ParseProsition(propositions: Array<string>): Proposition {
    return {
      id: +propositions[0],
      nomProposition: propositions[1],
      porteurProjet: propositions[2],
      montant: Web3.utils.fromWei(propositions[3], 'ether'),
      description: propositions[4],
      etat: propositions[5],
      nbVotes: +propositions[6],
      donEnCour: Web3.utils.fromWei(propositions[7], 'ether')
    } as Proposition

  }

  /**
   *  la fonction permet
   *  de faire un don 
   * @param proposition 
   */
  private faireDon(proposition: Proposition) {
    return () => {
      if (this.state.contrat) {
        const { input } = this.state;
        let valeur = String(input)
        const contrat: Contract = this.state.contrat!;
        contrat.methods.fairDon(proposition.id)
          .send({ from: this.state.compteConnecte, value: Web3.utils.toWei(valeur) })
          .on('transactionHas', (hash: string) => {
            console.log('tx hash', hash)
          })
          .on('confirmation', (no: number) => {
            console.log('conf', no)
          })
          .on('error', (erreur: Error) => {
            console.log('erreur', erreur.message)
          })
          .then(() => {
            this.mettreAjourPropositionSelected(proposition)
          })
      }

    }
  }
  /**
   *  elle permet de saisir*
   * */
  private handleChange() {
    return (evt: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({ input: evt.currentTarget.value });
    }
  }


  /**
   * elle permet d faire une vote Proposition 
   */
  private voterProposition(proposition: Proposition) {
    return () => {
      if (this.state.contrat) {
        const contrat: Contract = this.state.contrat!;
        contrat.methods.voterProposition(proposition.id)
          .send({ from: this.state.compteConnecte })
          .on('transactionHash', (hash: string) => {
            console.log('tx hash', hash)
          })
          .on('confirmation', (no: number) => {
            console.log('conf', no)
          })
          .on('error', (erreur: Error) => {
            console.log(erreur)
          })
          .then((data: Object) => console.log('validee', data));

        this.mettreAjourPropositionSelected(proposition);
      }
    }
  }
  /**
   * mettre une propostion A jours
   */
  private mettreAjourPropositionSelected(proposition: Proposition) {
    const propositionSelecteds: Array<Proposition> = this.state.propositionSelecteds;
    const id = propositionSelecteds.findIndex(prop => prop.id === proposition.id);
    propositionSelecteds[id] = proposition;
    this.setState({ propositionSelecteds })

  }
  /**
   * C'est une fonction qui
   * valide la cloture  de la vote 
   */
  private ClotureVote() {
    return () => {
      if (this.state.contrat) {
        const contrat: Contract = this.state.contrat!;
        contrat.methods.closeVote()
          .send({ from: this.state.compteConnecte })
          .on('transactionHash', (hash: string) => {
            console.log('tx hash', hash)
          })
          .on('confirmation', (no: number) => {
            console.log('conf', no)
          })
          .on('error', (erreur: Error) => {
            console.log(erreur)
          })
          .then((data: Object) => console.log('validee', data))
      }
    }
  }
  /**
   * elle renvoie la proposition gagnante
   */
  private propositionGagnante() {
    return () => {
      this.getPropositionGagnante();
    }
  }

  private getPropositionGagnante(): Proposition {
    const contrat: Contract = this.state.contrat!;
    return (
      contrat.methods.propositionGagnante().call()
    )
  }
}

export default App;
