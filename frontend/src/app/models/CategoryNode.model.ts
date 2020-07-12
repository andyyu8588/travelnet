export class foursquareCategory {
    id: string;
    name: string;
    pluralName: string;
    shortName: string;
    icon: {
      prefix: string;
      suffix: string
    }
    categories?: CategoryNode[]
}

export class CategoryNode {
<<<<<<< HEAD
 categories: CategoryNode[]
 name: string
 checked: boolean
 id: string
=======
  categories: CategoryNode[]
  name: string
  checked?: boolean
  hidden?: boolean

  // need recursive contructor for hidden property in childs
  constructor() {

  }
>>>>>>> b33cd92338b75d7a619672737aed032c568fe874
}

/** Flat to-do item node with expandable and level information */
export class CategoryFlatNode {
  name: string;
  level: number;
  expandable: boolean;
}

// export class DisplayCategoryNode extends CategoryNode {
//   hidden: boolean

//   constructor(bool: boolean, obj: {[key: string]: any}) {
//     super(obj.categories, obj.name)
//     this.hidden = bool
//   }
// }
