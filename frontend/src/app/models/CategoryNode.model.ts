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
  categories: CategoryNode[]
  name: string
  checked: boolean
}

/** Flat to-do item node with expandable and level information */
export class CategoryFlatNode {
  name: string;
  level: number;
  expandable: boolean;
}

export class DisplayCategoryNode extends CategoryNode {
  hidden: boolean

  constructor(bool: boolean) {
    super()
    this.hidden = bool
  }
}
