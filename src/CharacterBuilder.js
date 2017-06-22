import React, {Component} from 'react';
import CharacterView from './views/CharacterView';
import style from './buildstyle';

class CharacterBuilder extends Component {
  constructor() {
    super();
    this.state = {
      name: "",
      //Name doesn't affect any of the numbers, so it can stand alone.
      character_type: "Elite",
      //Character Type affects certain attribute calculations, handling Ultimate Techniques, and has other effects.
      //Non-Elite types have an unremovable Skill detailing the difference between an Elite and itself.
      //The only values it can have are "Elite", "Master", "Swarm", "Soldier", and "Flunky".
      is_npc: false,
      //This flag affects whether or not NPC-only Skills and Modifiers will show up in the skill selector.
      //Level and the five Base Attributes are the only things that will be top-level for now.
      //When Techniques are implemented, they will need the Active Attributes, Attack values,
      //Damage Increment (Reposition, etc.), and Health Increment (Ultimate Health Limit).
      level: 1,
      strength: 1,
      agility: 1,
      spirit: 1,
      mind: 1,
      guts: 1,
      //This Skill Bonuses sub-object holds static values that come from attribute-increasing Passive Skills.
      //Some of these skills have a diametrically opposed Flaw, but not all.
      skillBonuses: {
        balancedFighter: false, //from the "Balanced Fighter" skill
        maxHealth: 0, //from the "Tough" or "Fragile" skills
        maxStamina: 0, //from the "Tireless" or "Lack of Control" skills
        physicalAttack: 0, //from the "Physical Attacker" or "Weak Physical Attacker" skills
        energyAttack: 0, //from the "Energy Attacker" or "Weak Energy Attacker" skills
        defense: 0, //from the "Iron Defense" or "Weak Defender" skills
        resistance: 0, //from the "Resistant" or "Energy Vulnerability" skills
        movement: 0, //from the "Sprinter" or "Slow" skills
        techniquePoints: 0, //from the "Versatile Fighter" skill
        damageIncrement: 0, //from the "Improved Damage Increment" skill
        healingPower: 0, //from the "Healer" skill
      },
      //Overrides allow for ignoring certain rules and gaining the ability to directly modify attributes.
      //No overrides are currently implemented, although the Max Health override has been requested.
      overrides: {

      },
      //Skills and Techniques must be chosen and built out respectively.
      skills: [],
      //Each Skill is an object that looks like this:
      /*
      {
        key: Integer - this is here so React can iterate over character skills smoothly.
        name: String - The Skill's name. For a Custom Skill, this can't be changed.
        cost: Integer - The amount of SP it uses.
        level: Integer - What level the skill is. Fixed Skills stay at Level 1.
        effect: String - What effect the Skill has on the attached character.
        bonus: Object - {
          bonusName: Integer - The numerical increase provided by the Skill. This object is passed up to the skillBonuses object above with an Object.assign call...
            but only if the bonus exists. Only Passive skills will have this property.
        }
        special: String - The "Special" field from the book's entry.

      }
      */
      nextSkillId: 0,
      //Tells the CB what to use as the next key when adding a Skill.
      techniques: []
      //Each Technique is an object that looks like this:
      /*
        {
          name: String - The Technique's name.
          level: Integer - The Technique's level. This can't be changed directly - it's the sum of its Core level and Modifier levels.
          attribute: String - Can be blank, or any of the five Base Attributes. The controls to change this value are associated with the Core.
          core: Object: {
            name: String - The Core's name. This can't be changed.
            description: String - The Core's description. This also can't be changed.
            level: Integer - The Core's level. This can't be reduced below 0.
          }
          modifiers: [Objects: {
            name: String - The Modifier's name. This can't be changed.
            description: String - The Modifier's description. This can't be changed.
            level: Integer - The Modifier's level. This can't be reduced below 0.
          }]
        }
      */
    }
  }

  handleLevelChange(event) {
    var value = parseInt(event.target.value, 10);
    if ((this.state.is_npc || value <= 20) && value >= 0) {
      this.setState({'level': value});
    }
  }

  //Handles a change event for Strength.
  handleStrengthChange(event) {
    var value = parseInt(event.target.value, 10);
    if (this.validAttributeChange('strength', value)) {
      this.setState({'strength': value});
    }
  }

  //Handles a change event for Agility.
  handleAgilityChange(event) {
    var value = parseInt(event.target.value, 10);
    if (this.validAttributeChange('agility', value)) {
      this.setState({'agility': value});
    }
  }

  //Handles a change event for Spirit.
  handleSpiritChange(event) {
    var value = parseInt(event.target.value, 10);
    if (this.validAttributeChange('spirit', value)) {
      this.setState({'spirit': value});
    }
  }

  //Handles a change event for Mind.
  handleMindChange(event) {
    var value = parseInt(event.target.value, 10);
    if (this.validAttributeChange('mind', value)) {
      this.setState({'mind': value});
    }
  }

  //Handles a change event for Guts.
  handleGutsChange(event) {
    var value = parseInt(event.target.value, 10);
    if (this.validAttributeChange('guts', value)) {
      this.setState({'guts': value});
    }
  }

  handleTypeChange(event) {
    this.setState({'character_type': event.target.value})
    if (this.mustBeAnNPC(event.target.value)) {
      this.setState({'is_npc': true});
    }
  }

  validAttributeChange(attribute, value) {
    return (value <= this.state.level + 7 &&
        value >= 1 &&
        (this.unusedBaseAttributePoints() > 0 || value < this.state[attribute]));
  }

  handleNPCChange(event) {
    if (this.mustBeAnNPC(this.state.character_type)) {
      this.setState({'is_npc': true});
      return;
    }
    this.setState({'is_npc': event.target.checked});
  }

  handleRename(event) {
    this.setState({'name': event.target.value})
  }

  //Masters, Swarms, and Flunkies should always have is_npc set to true.
  mustBeAnNPC(type) {
    return (type === "Master" ||
            type === "Swarm" ||
            type === "Flunky");
  }

  baseAttributes() {
    return [
      this.state.strength,
      this.state.agility,
      this.state.spirit,
      this.state.mind,
      this.state.guts
    ]
  }

  baseAttributesSum() {
    return this.baseAttributes().reduce(function(total, next) {
      return total + next;
    }, 0);
  }

  unusedBaseAttributePoints() {
    return (22 + 3 * this.state.level) - this.baseAttributesSum();
  }

  objectify() {
    return {
      is_npc: this.state.is_npc,
      attributes: {
        name: this.state.name,
        level: this.state.level,
        strength: this.state.strength,
        agility: this.state.agility,
        spirit: this.state.spirit,
        mind: this.state.mind,
        guts: this.state.guts,
        skill_bonuses: this.state.skill_bonuses
      },
    }
  }

  //Add a new, blank skill to state.skills.
  addSkill() {
    var skills = this.state.skills;
    skills.push({
      id: this.state.nextSkillId,
      name: '',
      cost: 0,
      level: 0,
      bonus: {}
    });
    this.setState({nextSkillId: this.state.nextSkillId++});
    this.setState({skills: skills});
  }

  //Takes a data object from SkillContainer and updates the skills array in the state.
  updateSkill(new_data) {
    var skills = this.state.skills;
    skills.map(function(skill) {
      //if the key of the new data is the same
      if (skill.id === new_data.id) {
        return new_data;
      } else {
        return skill;
      }
    });
    this.setState({skills: skills});
  }

  removeSkill(id) {
    var skills = skills.filter(function(skill) {
      return skill.id !== id;
    });
  }

  render() {
    return <CharacterView
              character = {this.objectify()}
              character_type = {this.state.character_type}
              handleStrengthChange = {this.handleStrengthChange.bind(this)}
              handleAgilityChange = {this.handleAgilityChange.bind(this)}
              handleSpiritChange = {this.handleSpiritChange.bind(this)}
              handleMindChange = {this.handleMindChange.bind(this)}
              handleGutsChange = {this.handleGutsChange.bind(this)}
              handleLevelChange = {this.handleLevelChange.bind(this)}
              handleTypeChange = {this.handleTypeChange.bind(this)}
              handleNPCChange = {this.handleNPCChange.bind(this)}
              handleRename = {this.handleRename.bind(this)}
              skills = {this.state.skills}
              addSkill = {this.addSkill.bind(this)}
              updateSkill = {this.updateSkill.bind(this)}
              removeSkill = {this.updateSkill.bind(this)}/>;
  }
}

export default CharacterBuilder;
