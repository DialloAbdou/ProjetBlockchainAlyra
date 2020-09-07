export interface Proposition {
    id : number;
    nomProposition : string;
    porteurProjet: string;
    montant :string;
    description:string
    etat:EtatProposition;
    nbVotes: number;
    donEnCour : string  ;
}

export enum EtatProposition {
    SelectionEncours ='0',
    Selectionner='1' ,
    Valide='2',
    Refus='3'

}