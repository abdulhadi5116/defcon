const rendered=new WeakMap();
const identity=node=>node?.nodeType===1?['id','data-type','data-contact','data-mode','data-member','data-remove'].map(name=>node.hasAttribute(name)?`${node.nodeName}:${name}:${node.getAttribute(name)}`:null).find(Boolean):null;
const compatible=(a,b)=>a&&a.nodeType===b.nodeType&&a.nodeName===b.nodeName;
function updateNode(current,next){
 if(current.nodeType===3){if(current.data!==next.data)current.data=next.data;return;}
 if(current.nodeType!==1)return;
 for(const attribute of [...current.attributes])if(!next.hasAttribute(attribute.name))current.removeAttribute(attribute.name);
 for(const attribute of next.attributes)if(current.getAttribute(attribute.name)!==attribute.value)current.setAttribute(attribute.name,attribute.value);
 updateChildren(current,next);
}
function updateChildren(parent,next){
 const children=[...next.childNodes];
 for(let index=0;index<children.length;index++){
  const desired=children[index],key=identity(desired),before=parent.childNodes[index];
  const existing=key?[...parent.childNodes].slice(index).find(node=>identity(node)===key):!identity(before)&&compatible(before,desired)?before:null;
  if(!existing){parent.insertBefore(desired.cloneNode(true),before||null);continue;}
  if(existing!==before)parent.insertBefore(existing,before||null);
  updateNode(existing,desired);
 }
 while(parent.childNodes.length>children.length)parent.lastChild.remove();
}
// Preserve controls across live refreshes so pointerdown/up and keyboard focus reach the same button.
export function renderHTML(container,html){if(rendered.get(container)===html)return;const template=document.createElement('template');template.innerHTML=html;updateChildren(container,template.content);rendered.set(container,html);}
