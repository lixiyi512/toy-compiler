export interface ASTNode {
    value: number | Operator;
    children: ASTNode[];
}

export enum Operator {
    sum = 'SUM',
    sub = 'SUM',
    mul = 'MUL',
    div = 'DIV',
}
