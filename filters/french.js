var util = require("../lib/util");
var regex = util.regex;
var track = util.track;

track("végétalien", "végétalienne", "vegan", "végane");

var vegan = "(totalement |complètement |entièrement |intégralement )?(vegan|végan|végane|végétalien|végétalienne)"
var becomeVegan = "(devenir|être) " + vegan
var absolutly = "(absolument |à tout prix |totalement |sérieusement )?"

module.exports = [
    // Ask for help
    regex( "j('|e )(ai|aurais|vais( avoir)?) (absolument |sérieusement )?(avoir )?besoin d(e |')(soutien|conseils|informations|renseignements|aide|assistance|un guide|un coup de (main|pouce)) (pour |afin d(e |'))(essayer d(e |')|pouvoir )?" + becomeVegan ),
    regex( "j(e |')(veux|voudrais|souhaite|souhaiterais|aimerais|cherche à) (avoir|obtenir|recueillir) (des (informations|renseignements|conseils)|de l'aide|d'assistance|un coup de (main|pouce)|un guide) (pour |afin d(e |'))(essayer d(e |')|pouvoir )?" + becomeVegan ),
    regex( "(aidez|aide)(-| )moi à " + becomeVegan ),
    regex( "(pouvez|peux|pourriez|pourrais)(-| )(vous|tu) (m'|me )(aider|conseiller|assister|guider) (à|pour) " + becomeVegan ),

    // Want to become vegan
    regex( "je (veux|voudrais|souhaite|souhaiterais|cherche|viens de (me )?décider|pense( vouloir)?|suis entrain (de penser|d'essayer)) (de |à |d')?" + absolutly + "(de |à |d')?" + becomeVegan ),
    regex( "j'(espère|envisage|essaye|ai (envie|décidé)|aimerais|hésite) " + absolutly + "(de |à |d')?" + absolutly + becomeVegan ), 
    
    // I went vegan
    regex( "je (suis devenu(e)?|(vais|viens de) devenir) " + vegan ),
    
    // I wish I were vegan
    regex( "j'aurais (voulu|souhaité|aimé) " + becomeVegan ),
    regex( "je (m'|me )(imagine|vois|verrais) ((assez |plutôt )?bien |déjà )?" + becomeVegan ),

    // I'm having a hard time staying vegan
    regex( "je n'arrive(rais)? (plus|pas) à (rester|(continuer à )?être) (plus longtemps )?" + vegan + "( plus longtemps)?" ),
    regex( "j'ai (de plus en plus de|du) mal à (rester|(continuer à )?être) (plus longtemps )?" + vegan + "( plus longtemps)?" ),
    regex( "je ne sais pas( pour)? combien de temps( encore)? je (vais( pouvoir)?|peux|pourrais) (encore )?(rester|(continuer à )?être) " + vegan )
]
