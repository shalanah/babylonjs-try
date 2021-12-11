import { Vector3, Mesh, VertexData } from "@babylonjs/core";

// Thought rounded square might be less pointy :)
// Source: https://www.babylonjs-playground.com/#14VFYX#0
export const sampleSuperEllipsoid = (
  phi,
  beta,
  n1,
  n2,
  scaleX,
  scaleY,
  scaleZ
) => {
  var cosPhi = Math.cos(phi);
  var cosBeta = Math.cos(beta);
  var sinPhi = Math.sin(phi);
  var sinBeta = Math.sin(beta);
  var vertex = new Vector3();
  vertex.x =
    scaleX *
    Math.sign(cosPhi) *
    Math.pow(Math.abs(cosPhi), n1) *
    Math.sign(cosBeta) *
    Math.pow(Math.abs(cosBeta), n2);
  vertex.z =
    scaleY *
    Math.sign(cosPhi) *
    Math.pow(Math.abs(cosPhi), n1) *
    Math.sign(sinBeta) *
    Math.pow(Math.abs(sinBeta), n2);
  vertex.y = scaleZ * Math.sign(sinPhi) * Math.pow(Math.abs(sinPhi), n1);
  return vertex;
};
export const calculateNormal = (phi, beta, n1, n2, scaleX, scaleY, scaleZ) => {
  var normal = new Vector3();
  var cosPhi = Math.cos(phi);
  var cosBeta = Math.cos(beta);
  var sinPhi = Math.sin(phi);
  var sinBeta = Math.sin(beta);
  normal.x =
    (Math.sign(cosPhi) *
      Math.pow(Math.abs(cosPhi), 2 - n1) *
      Math.sign(cosBeta) *
      Math.pow(Math.abs(cosBeta), 2 - n2)) /
    scaleX;
  normal.z =
    (Math.sign(cosPhi) *
      Math.pow(Math.abs(cosPhi), 2 - n1) *
      Math.sign(sinBeta) *
      Math.pow(Math.abs(sinBeta), 2 - n2)) /
    scaleY;
  normal.y = (Math.sign(sinPhi) * Math.pow(Math.abs(sinPhi), 2 - n1)) / scaleZ;
  //normal=normal.normalize();
  normal.normalize();
  return normal;
};

export const createSuperEllipsoid = (
  samples,
  n1,
  n2,
  scalex,
  scaley,
  scalez,
  scene
) => {
  var superello = new Mesh("superello", scene);
  var phi = 0.0,
    phi2 = 0.0,
    beta = 0.0;
  var dB = (Math.PI * 2.0) / samples;
  var dP = (Math.PI * 2.0) / samples;
  phi = -Math.PI / 2;
  var vertices = [];
  var normals = [];
  for (var j = 0; j <= samples / 2; j++) {
    beta = -Math.PI;
    for (var i = 0; i <= samples; i++) {
      //Triangle #1
      vertices.push(
        sampleSuperEllipsoid(phi, beta, n1, n2, scalex, scaley, scalez)
      );
      normals.push(calculateNormal(phi, beta, n1, n2, scalex, scaley, scalez));
      vertices.push(
        sampleSuperEllipsoid(phi + dP, beta, n1, n2, scalex, scaley, scalez)
      );
      normals.push(
        calculateNormal(phi + dP, beta, n1, n2, scalex, scaley, scalez)
      );
      vertices.push(
        sampleSuperEllipsoid(
          phi + dP,
          beta + dB,
          n1,
          n2,
          scalex,
          scaley,
          scalez
        )
      );
      normals.push(
        calculateNormal(phi + dP, beta + dB, n1, n2, scalex, scaley, scalez)
      );
      //Triangle #2
      vertices.push(
        sampleSuperEllipsoid(phi, beta, n1, n2, scalex, scaley, scalez)
      );
      normals.push(calculateNormal(phi, beta, n1, n2, scalex, scaley, scalez));
      vertices.push(
        sampleSuperEllipsoid(
          phi + dP,
          beta + dB,
          n1,
          n2,
          scalex,
          scaley,
          scalez
        )
      );
      normals.push(
        calculateNormal(phi + dP, beta + dB, n1, n2, scalex, scaley, scalez)
      );
      vertices.push(
        sampleSuperEllipsoid(phi, beta + dB, n1, n2, scalex, scaley, scalez)
      );
      normals.push(
        calculateNormal(phi, beta + dB, n1, n2, scalex, scaley, scalez)
      );
      beta += dB;
    }
    phi += dP;
  }
  var shapeReturned = new VertexData();
  shapeReturned.positions = [];
  shapeReturned.normals = [];
  shapeReturned.indices = [];
  shapeReturned.uvs = [];
  var indice = 0;

  for (var i = 0; i < vertices.length; i++) {
    shapeReturned.indices.push(indice++);
    shapeReturned.positions.push(vertices[i].x);
    shapeReturned.positions.push(vertices[i].y);
    shapeReturned.positions.push(vertices[i].z);
    shapeReturned.normals.push(normals[i].x);
    shapeReturned.normals.push(normals[i].y);
    shapeReturned.normals.push(normals[i].z);
  }
  shapeReturned.applyToMesh(superello);
  return superello;
};
