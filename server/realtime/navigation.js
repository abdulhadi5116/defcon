import {Navigation,COAST_MARGIN} from '../../public/navigation.js';
// Identical geometry, cached by exact coordinates. Idle hulls should not rescan
// thousands of coastline segments on every server tick. Bound long game memory.
export class ServerNavigation extends Navigation {
 constructor(land){super(land);this.waterPoints=new Map();}
 navigable(x,y,clearance=COAST_MARGIN){const key=`${x}/${y}/${clearance}`;if(this.waterPoints.has(key))return this.waterPoints.get(key);const value=super.navigable(x,y,clearance);if(this.waterPoints.size>=8192)this.waterPoints.clear();this.waterPoints.set(key,value);return value;}
}
