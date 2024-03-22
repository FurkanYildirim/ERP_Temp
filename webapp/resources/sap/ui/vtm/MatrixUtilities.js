/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["jquery.sap.global"],function(jQuery){"use strict";var e=0,t=1,r=2,n=3,i=4,a=5,T=6,u=7,f=8,s=9,M=10,o=11,N=12,O=0,l=1,I=2,X=3,x=4,A=5,v=6,C=7,g=8,c=9,m=10,_=11,E=12;var R={};R.isValid=function(e,t){if(!e||!Array.isArray(e)||e.length!==13){return false}if(t){return R.isInvertible(e)}return true};R.createIdentity=function(){return[0,0,0,1,0,0,0,1,0,0,0,1,1]};R.areEqual=function(e,t){for(var r=0;r<e.length;r++){if(Math.abs(e[r]-t[r])>.01){return false}}return true};R.isInvertible=function(e){var t=0,r=0,N=e[n],O=e[i],l=e[a],I=e[T],X=e[u],x=e[f],A=e[s],v=e[M],C=e[o],g=N*X*C;if(g>=0){t+=g}else{r+=g}g=I*v*l;if(g>=0){t+=g}else{r+=g}g=A*O*x;if(g>=0){t+=g}else{r+=g}g=-A*X*l;if(g>=0){t+=g}else{r+=g}g=-I*O*C;if(g>=0){t+=g}else{r+=g}g=-N*v*x;if(g>=0){t+=g}else{r+=g}var c=t+r;if(c==0||Math.abs(c)<(t-r)*1e-12){return false}return true};R.invert=function(N){var O=0,l=0,I=N[e],X=N[t],x=N[r],A=N[n],v=N[i],C=N[a],g=N[T],c=N[u],m=N[f],_=N[s],E=N[M],P=N[o],S=A*c*P,p=R.createIdentity();if(S>=0){O+=S}else{l+=S}S=g*E*C;if(S>=0){O+=S}else{l+=S}S=_*v*m;if(S>=0){O+=S}else{l+=S}S=-_*c*C;if(S>=0){O+=S}else{l+=S}S=-g*v*P;if(S>=0){O+=S}else{l+=S}S=-A*E*m;if(S>=0){O+=S}else{l+=S}var b=O+l;if(b==0||Math.abs(b)<(O-l)*1e-12){return p}var y=1/b;p[n]=(c*P-E*m)*y;p[i]=-(v*P-E*C)*y;p[a]=(v*m-c*C)*y;p[T]=-(g*P-_*m)*y;p[u]=(A*P-_*C)*y;p[f]=-(A*m-g*C)*y;p[s]=(g*E-_*c)*y;p[M]=-(A*E-_*v)*y;p[o]=(A*c-g*v)*y;p[e]=-(I*p[n]+X*p[T]+x*p[s]);p[t]=-(I*p[i]+X*p[u]+x*p[M]);p[r]=-(I*p[a]+X*p[f]+x*p[o]);return p};R.to4x4Matrix=function(O){var l=[];l[0]=[O[n],O[i],O[a],0];l[1]=[O[T],O[u],O[f],0];l[2]=[O[s],O[M],O[o],0];l[3]=[O[e],O[t],O[r],O[N]];return l};R.from4x4Matrix=function(O){var l=[];l[n]=O[0][0];l[i]=O[0][1];l[a]=O[0][2];l[T]=O[1][0];l[u]=O[1][1];l[f]=O[1][2];l[s]=O[2][0];l[M]=O[2][1];l[o]=O[2][2];l[e]=O[3][0];l[t]=O[3][1];l[r]=O[3][2];l[N]=O[3][3];return l};R.fromVkMatrix=function(O){var l=[];l[n]=O[0];l[i]=O[1];l[a]=O[2];l[T]=O[3];l[u]=O[4];l[f]=O[5];l[s]=O[6];l[M]=O[7];l[o]=O[8];l[e]=O[9];l[t]=O[10];l[r]=O[11];l[N]=1;return l};R.toVkMatrix=function(N){var O=[];O[0]=N[n];O[1]=N[i];O[2]=N[a];O[3]=N[T];O[4]=N[u];O[5]=N[f];O[6]=N[s];O[7]=N[M];O[8]=N[o];O[9]=N[e];O[10]=N[t];O[11]=N[r];return O};R.fromVsmMatrixString=function(R){var P=R.split(" ").map(function(e){return parseFloat(e)});var S=[];S[n]=P[O];S[i]=P[l];S[a]=P[I];S[T]=P[X];S[u]=P[x];S[f]=P[A];S[s]=P[v];S[M]=P[C];S[o]=P[g];S[e]=P[c];S[t]=P[m];S[r]=P[_];S[N]=P[E];return S};R.toVsmMatrixString=function(R){var P=[];P[O]=R[n];P[l]=R[i];P[I]=R[a];P[X]=R[T];P[x]=R[u];P[A]=R[f];P[v]=R[s];P[C]=R[M];P[g]=R[o];P[c]=R[e];P[m]=R[t];P[_]=R[r];P[E]=R[N];return P.join(" ")};R.multiply=function(O,l){var I=[],X=O[e],x=O[t],A=O[r],v=O[n],C=O[i],g=O[a],c=O[T],m=O[u],_=O[f],E=O[s],R=O[M],P=O[o],S=O[N],p=l[e],b=l[t],y=l[r],d=l[n],h=l[i],V=l[a],L=l[T],Y=l[u],Z=l[f],j=l[s],k=l[M],q=l[o],B=l[N];I[n]=v*d+C*L+g*j;I[i]=v*h+C*Y+g*k;I[a]=v*V+C*Z+g*q;I[T]=c*d+m*L+_*j;I[u]=c*h+m*Y+_*k;I[f]=c*V+m*Z+_*q;I[s]=E*d+R*L+P*j;I[M]=E*h+R*Y+P*k;I[o]=E*V+R*Z+P*q;I[e]=X*d+x*L+A*j+S*p;I[t]=X*h+x*Y+A*k+S*b;I[r]=X*V+x*Z+A*q+S*y;I[N]=S*B;return I};R.getMatrixComponentNames=function(){if(!R._matrixComponentNames){var e=sap.ui.vtm.getResourceBundle();R._matrixComponentNames=[e.getText("TMATRIXCOMPONENT_LOCX"),e.getText("TMATRIXCOMPONENT_LOCY"),e.getText("TMATRIXCOMPONENT_LOCZ"),e.getText("TMATRIXCOMPONENT_AXIS1X"),e.getText("TMATRIXCOMPONENT_AXIS1Y"),e.getText("TMATRIXCOMPONENT_AXIS1Z"),e.getText("TMATRIXCOMPONENT_AXIS2X"),e.getText("TMATRIXCOMPONENT_AXIS2Y"),e.getText("TMATRIXCOMPONENT_AXIS2Z"),e.getText("TMATRIXCOMPONENT_AXIS3X"),e.getText("TMATRIXCOMPONENT_AXIS3Y"),e.getText("TMATRIXCOMPONENT_AXIS3Z"),e.getText("TMATRIXCOMPONENT_SCALE")]}return R._matrixComponentNames};return R},true);
//# sourceMappingURL=MatrixUtilities.js.map