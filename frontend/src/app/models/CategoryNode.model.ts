export class CategoryNode {
 categories: CategoryNode[];
 name: string;
}

/** Flat to-do item node with expandable and level information */
export class CategoryFlatNode {
 name: string;
 level: number;
 expandable: boolean;
}
