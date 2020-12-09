import { Component } from '@angular/core';
import { ASTNode, Operator } from './data.model';

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
  ASTTemplate = [];
  expression = '';
  result = 0;

  lexer(str): string[] {
    return str.split(' ').map(s => s.trim()).filter(s => s.length);
  }

  compileInput(): void {
    const tokenizedArray = this.lexer(this.inputText);

    this.isValid = this.isValidExp(tokenizedArray);
    this.validationMsg = this.isValid ? 'expression valid!' : 'invalid expression';
    this.outputText = tokenizedArray;
    if (this.isValid) {
      this.AST = this.buildAST(tokenizedArray);
      this.renderAST(this.AST);
      this.expression = this.generateExpr(this.AST);
      this.result = eval(this.expression);
    }
  }

  buildAST(arr): ASTNode {
    const treeRoot: ASTNode = {
      value: arr[0],
      children: [],
    };
    let root = treeRoot;
    for (let i = 1; i < arr.length; i++) {
      const current: ASTNode = {
        value: arr[i],
        children: [],
      };
      root.children.push(current);
      if (this.isOperator(current.value)) {
        root = current;
      }
    }
    return treeRoot;
  }

  generateExpr(root: ASTNode): string {
    if (!root.children || !root.children.length) {
      return root.value + '';
    }
    let res = '';
    const op = opMap[root.value];
    root.children.forEach((child, index, arr) => {
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

  renderAST(root: ASTNode): void {
    this.ASTTemplate = [];
    const queue = [root];
    while (queue.length) {
      const size = queue.length;
      const level = [];
      for (let i = 0; i < size; i++) {
        const curr = queue.shift();
        level.push(curr.value);
        for (const child of curr.children) {
          queue.push(child);
        }
      }
      this.ASTTemplate.push(level);
    }
  }

  private isValidExp(strArr): boolean {
    for (let i = 0; i < strArr.length; i++) {
      const s = strArr[i];
      const type = this.isTypeOf(s);
      if (i === strArr.length - 1) {
        if (type !== 'num') {
          return false;
        }
      }
      if (i === 0) {
        if (type !== 'op') {
          return false;
        }
      } else {
        const prevType = this.isTypeOf(strArr[i - 1]);
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
}
