'use strict';

let CPGoalplanningTextEdtiorFactory = function () {
  'ngInject';
  let textarea;
  let topVal = 0;
  if(navigator.appVersion.indexOf("Chrome") !== -1) topVal = 1;
  return {

      getTexarea : () =>{
          return textarea;
      },
      setTextEditor: (diagram) => {
        textarea = document.createElement('textarea');
        textarea.id = "GoalDiagramGoJSTextEditor";
        
        let defaultTextValue = '';
        
        textarea.addEventListener('input', function(e) {
            let tool = textEditor.tool;
            if (tool.textBlock === null) return;
            let tempText = tool.measureTemporaryTextBlock(this.value);
    
            let oldskips = diagram.skipsUndoManager;
            diagram.skipsUndoManager = true;
            diagram.startTransaction("Change stroke");
    
            tool.textBlock.text = textarea.value;
    
            diagram.commitTransaction("Change stroke");
            diagram.skipsUndoManager = oldskips;
            
            let loc = tool.textBlock.getDocumentPoint(go.Spot.TopLeft);
            let pos = diagram.position;
            let scale = diagram.scale;

            let maxWidth = parseInt(tool.textBlock._maxWidth);
            let width = tool.textBlock.naturalBounds.width;
            if ( width > maxWidth)  {
                width = maxWidth;
                tool.textBlock.width = maxWidth;
            }

            this.style.maxwidth = maxWidth + 'px!important;';
            this.style.width = width + 'px';
            this.style.height = tool.textBlock.naturalBounds.height + "px";
            this.style.left = Math.floor((loc.x - pos.x - 1) * scale) + 'px';
            this.style.top = Math.floor((loc.y - pos.y + topVal) * scale) + 'px';
        }, false);
        
        textarea.addEventListener('keydown', function(e) {
            let tool = textEditor.tool;
            if (tool.textBlock === null) return;
            let key = e.which;
            if (key === 13) { // Enter
                if (tool.textBlock.isMultiline === false) e.preventDefault();
                tool.acceptText(go.TextEditingTool.Enter);
            } else if (key === 9) { // Tab
                tool.acceptText(go.TextEditingTool.Tab);
                e.preventDefault();
            } else if (key === 27) { // Esc
                let oldskips = diagram.skipsUndoManager;
                diagram.skipsUndoManager = true;
                diagram.startTransaction("Change stroke");
    
                tool.textBlock.text = defaultTextValue;
    
                diagram.commitTransaction("Change stroke");
                diagram.skipsUndoManager = oldskips;
                
                tool.doCancel();
                if (tool.diagram !== null) tool.diagram.doFocus();
            }
        }, false);
        
        textarea.addEventListener('focus', function(e) {
            let tool = textEditor.tool;
            if (!tool || tool.currentTextEditor === null) return;
        
            if (tool.state === go.TextEditingTool.StateActive) {
                tool.state = go.TextEditingTool.StateEditing;
            }
        
            if (tool.selectsTextOnActivate) {
                textarea.select();
                textarea.setSelectionRange(0, 9999);
            }
        }, false);
        
        textarea.addEventListener('blur', function(e) {
            let tool = textEditor.tool;
            if (!tool || tool.currentTextEditor === null) return;
            
            textarea.focus();
        
            if (tool.selectsTextOnActivate) {
                textarea.select();
                textarea.setSelectionRange(0, 9999);
            }
        }, false);
    
    
        let textEditor = new go.HTMLInfo();
    
        textEditor.valueFunction = function() {
            let text = textarea.value;
            if (tempTextBlock._trim) text = text.trim();
            if (tempTextBlock._required && text.length === 0) text = defaultTextValue;
            return text;
        };
    
        textEditor.mainElement = textarea;
        
        let tempTextBlock;
        textEditor.show = function(textBlock, diagram, tool) {
            if (!(textBlock instanceof go.TextBlock)) return;
            let selnode = diagram.selection.first();

            if (!textBlock.__oldStroke) {
                let oldskips = diagram.skipsUndoManager;
                diagram.skipsUndoManager = true;
                diagram.startTransaction("Change stroke");

                textBlock.__oldStroke = textBlock.stroke;
                textBlock.stroke = 'transparent';
                tempTextBlock = textBlock;

                diagram.commitTransaction("Change stroke");
                diagram.skipsUndoManager = oldskips;
            }
        
            textEditor.tool = tool;
            
            if (tool.state === go.TextEditingTool.StateInvalid) {
                textarea.style.border = '1px solid red';
                textarea.focus();
                return;
            }
    
            defaultTextValue = textBlock.text;
            textarea.value = textBlock.text;
            textarea.rows = textBlock.maxLines;
            
            diagram.div.style['font'] = textBlock.font;
            
            let maxLength = parseInt(textBlock._maxLength);
            if (maxLength > 0) {
                textarea.maxLength = maxLength;
            } else {
                textarea.removeAttribute('maxLength');
            }

            let loc = textBlock.getDocumentPoint(go.Spot.TopLeft);
            let pos = diagram.position;
            let scale = diagram.scale;

            let width = textBlock.naturalBounds.width;
            let maxWidth = parseInt(textBlock._maxWidth);
            if ( width > maxWidth)  {
                width = maxWidth;
                textBlock.width = maxWidth;
            }

            textarea.style.cssText =
                'position: absolute;' +
                'box-shadow: none;' +
                'background: none;' +
                'resize: none;' +
                'transform: scale(' + scale + ');'+
                'transform-origin: 0 0;' +
                'z-index: 60;' +
                'font: inherit;' +
                'line-height: 16px;' +
                'max-width: ' + maxWidth + 'px!important;' +
                'width: ' + width + 'px;' +
                'height: ' + textBlock.naturalBounds.height + 'px;' +
                'left: ' + Math.floor((loc.x - pos.x - 1) * scale) + 'px;' +
                'top: ' + Math.floor((loc.y - pos.y + topVal) * scale) + 'px;' +
                'text-align: ' + textBlock.textAlign + ';' +
                'color: ' + (textBlock.__oldStroke || textBlock.stroke) + ';' +
                'margin: 0;' +
                'padding: 0 1px;' +
                'border: 0;' +
                'outline: none;' +
                'white-space: ' + (textBlock.maxLines && textBlock.maxLines > 1 ? 'pre-wrap' : 'nowrap') + ';' +
                'overflow: hidden;';
            if(selnode !== null) {
	            if (selnode.data.category === 'root')
	                textarea.style.cssText = textarea.style.cssText + 'background: white;';
	            else textarea.style.cssText = textarea.style.cssText + 'background: #e8e8e8;';
	        }
            diagram.div.appendChild(textarea);
            
            textarea.focus();
            if (tool.selectsTextOnActivate) {
                textarea.select();
                textarea.setSelectionRange(0, 9999);
            }
        };
    
        textEditor.hide = function(diagram, tool) {
            diagram.div.removeChild(textarea);
            textEditor.tool = null;
            if (tempTextBlock && tempTextBlock.__oldStroke) {
                let oldskips = diagram.skipsUndoManager;
                diagram.skipsUndoManager = true;
                diagram.startTransaction("Change stroke");

                tempTextBlock.stroke = tempTextBlock.__oldStroke;
                delete tempTextBlock.__oldStroke;

                diagram.commitTransaction("Change stroke");
                diagram.skipsUndoManager = oldskips;
            }
        };
    
        let tool = diagram.toolManager.textEditingTool;
        tool.selectsTextOnActivate = false;
        tool.defaultTextEditor = textEditor;
        
    }
  }
};

export default CPGoalplanningTextEdtiorFactory;