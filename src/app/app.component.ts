import {Component} from '@angular/core';
import {ASTNode, Operator} from './data.model';

declare const Treant: any;

const OPERATORS: string[] = ['sum', 'sub', 'mul', 'div'];

const opMap = {
    sum: '+',
    sub: '-',
    div: '/',
    mul: '*'
};

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent {
    inputText: string;
    outputText;
    isValid: boolean = null;
    validationMsg = '';
    AST: ASTNode = null;
    expression = '';
    result = 0;

    treantConfig: any = {
        chart: {
            container: "#ast"
        },
        nodeStructure: {}
    };

    /*
        lexer() turns input string into array of operators and numbers.
        @param {string} str: input string
        @return {string[]} array of tokens
    */
    lexer(str): string[] {
        return str.split(' ').map(s => s.trim()).filter(s => s.length);
    }

    /*
        buildAST() constructs Abstract Syntax Tree and builds the view template of tree
        @param {string[]} arr: array of tokens
        @return {ASTNode} root node of tree
    */
    buildAST(arr): ASTNode {
        // generate root of AST
        const treeRoot: ASTNode = {
            value: arr[0],
            children: [],
        };
        // generate tree root of view template for Treant library
        this.treantConfig.nodeStructure = {
            text: {title: arr[0]},
            children: []
        };
        let root = treeRoot;
        let treantRoot = this.treantConfig.nodeStructure;
        // pre-order
        // iterate the rest of array to construct AST
        for (let i = 1; i < arr.length; i++) {
            const current: ASTNode = {
                value: arr[i],
                children: [],
            };
            root.children.push(current);
            const currentTreant = {
                text: {title: arr[i]},
                children: []
            };
            treantRoot.children.push(currentTreant);
            // if it's an operator, it must be the parent of the following node(s)
            if (this.isOperator(current.value)) {
                root = current;
                treantRoot = currentTreant;
            }
        }
        return treeRoot;
    }

    /*
        generateExpr() translates AST into math expression
        @param {ASTNode} root: syntax tree root
        @return {string} string of math expression
    */

    generateExpr(root: ASTNode): string {
        if (!root.children || !root.children.length) {
            return root.value + '';
        }
        let res = '';
        // turns node value into mathematical operator
        const op = opMap[root.value];
        root.children.forEach((child, index, arr) => {
            // recursively flat the tree
            const childExpr = this.generateExpr(child);
            if (index === 0) {
                res += '(' + childExpr;
            } else {
                res += ' ' + op + ' ' + childExpr;
            }
            if (index === arr.length - 1) {
                res += ')';
            }
        });
        return res;
    }

    /*
        compileInput() processes user input
        this function is called everytime when input changes
    */

    compileInput(): void {
        const tokenizedArray = this.lexer(this.inputText);
        this.isValid = tokenizedArray ? this.isValidExp(tokenizedArray) : true;
        if (tokenizedArray.length === 0) {
          this.validationMsg = '';
        } else {
          this.validationMsg = this.isValid ? 'Expression valid' : 'Invalid expression!';
        }
        
        // store the token array if it passes syntax checker
        this.outputText = tokenizedArray;
        if (this.isValid) {
            // build AST
            this.AST = this.buildAST(tokenizedArray);
            // render AST visualization
            Treant(this.treantConfig);
            // interpret AST to math expr
            this.expression = this.generateExpr(this.AST);
            // evaluate the result
            this.result = eval(this.expression);
        } else {
          this.expression = '';
          this.result = null;
        }
    }

    // Utility functions

    /*
        isValidExp() checks syntax of the expression
        @param {string[]} strArr: array of tokens
        @return {boolean} result of the grammar checker
    */
    private isValidExp(strArr): boolean {
        for (let i = 0; i < strArr.length; i++) {
            const s = strArr[i];
            const type = this.isTypeOf(s);
            if (i === strArr.length - 1) {
                // expression should end with number
                if (type !== 'num') {
                    return false;
                }
            }
            if (i === 0) {
                // expression should begin with operator
                if (type !== 'op') {
                    return false;
                }
            } else {
                const prevType = this.isTypeOf(strArr[i - 1]);
                // no consecutive operators
                if (!type || (type === 'op' && prevType === 'op')) {
                    return false;
                }
            }
        }
        return true;
    }

    private isTypeOf(str): string | boolean {
        if (OPERATORS.indexOf(str) > -1) {
            return 'op';
        }
        if (/^[0-9]*$/g.test(str)) {
            return 'num';
        }
        return false;
    }

    private isNumberString(str): boolean {
        return /^[0-9]*$/g.test(str);
    }

    private isOperator(str): boolean {
        return OPERATORS.indexOf(str) > -1;
    }

    public getValidationClass(): string {
      return this.isValid ? 'valid' : 'invalid';
    }
}
