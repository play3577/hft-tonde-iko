/*
 * Copyright 2014, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
"use strict";

define(
  [ '../bower_components/hft-utils/dist/imageutils',
    '../bower_components/tdl/tdl/math',
    '../bower_components/tdl/tdl/particles',
    '../bower_components/tdl/tdl/textures',
  ], function(
    ImageUtils,
    Maths,
    Particles,
    Textures) {

  var onePixelTexture;
  var ringTexture;
  var squareTexture;

  var setup = function() {
    if (!onePixelTexture) {
      onePixelTexture = new Textures.SolidTexture([255,255,255,255]);
      var c = document.createElement("canvas");
      var ctx = c.getContext("2d");
      c.width = 32;
      c.height = 32;
      ctx.beginPath();
      ctx.arc(c.width / 2, c.height / 2, 14, 0, Math.PI * 2, true);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
//      ctx.fillStyle = "white";
//      ctx.fillRect(0, 0, c.width, c.height);
      ringTexture = new Textures.Texture2D(c);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.strokeRect(3, 3, ctx.canvas.width - 6, ctx.canvas.height - 6);
      squareTexture = new Textures.Texture2D(c);
    }
  };

  var addColorToRamp = function(ramp, h, s, v, a) {
    var c = ImageUtils.hsvToRgb(h, s, v);
    ramp.push(c[0] / 255, c[1] / 255, c[2] / 255, a);
  };

  var createExit = function(particleSystemManager) {
//  var emitter = particleSystemManager.createParticleEmitter(onePixelTexture.texture);
    var emitter = particleSystemManager.createParticleEmitter(squareTexture.texture);
    emitter.setState(tdl.particles.ParticleStateIds.BLEND);
    emitter.setColorRamp(
        [0.1, 0.85, 1, 0,
         0.1, 0.85, 1, 0.3,
         0.1, 1.0, 1, 0.6,
         0.1, 1.0, 1, 1,
         0.1, 0.85, 1, 0.6,
         0.1, 0.85, 1, 1,
         0.1, 0.85, 1, 0.1,
      ]);
    var numParticles = 15;
    emitter.setParameters({
        numParticles: numParticles,
        lifeTime: 0.8,
        timeRange: 0.8,
        startSize: 140.0,
        endSize: 0.0,
        spinSpeedRange: 0.1},
        function(index, parameters) {
            var speed = Math.random() * 10 + 20;
            var angle = index / numParticles * Math.PI * 2; //Math.random() * 2 * Math.PI;
            parameters.position = Maths.matrix4.transformPoint(
                Maths.matrix4.rotationZ(angle), [-speed * 0.1, 0, 0])
            parameters.velocity = Maths.matrix4.transformPoint(
                Maths.matrix4.rotationZ(angle), [speed * 0, 0, 0]);
            parameters.acceleration = Maths.matrix4.transformPoint(
                Maths.matrix4.rotationZ(angle), [speed * 0, 0, 0]);
        });
    return emitter;
  };

  var createPortal = function(particleSystemManager, data) {
//    var emitter = particleSystemManager.createParticleEmitter(onePixelTexture.texture);
//   var emitter = particleSystemManager.createParticleEmitter();
   var emitter = particleSystemManager.createParticleEmitter(ringTexture.texture);
    emitter.setState(tdl.particles.ParticleStateIds.BLEND);
    var ramp = [];
    var h = (1 + data.tileInfo.dest / 12 - 0.1) % 1;
    addColorToRamp(ramp, h, 0.5,   1, 0.0);
    addColorToRamp(ramp, h, 0.6,   1, 0.3);
    addColorToRamp(ramp, h, 0.9,   1, 0.6);
    addColorToRamp(ramp, h, 0.9,   1, 0.9);
    addColorToRamp(ramp, h, 0.6,   1, 0.6);
    addColorToRamp(ramp, h, 0.3,   1, 0.5);
    addColorToRamp(ramp, h, 0.3,   1, 0.3);
    emitter.setColorRamp(ramp);
    var numRings = 12;
    var numParticlesPerRing = 1;
    var lifeTime = 1.0;
    emitter.setParameters({
        numParticles: numRings * numParticlesPerRing,
        lifeTime:  lifeTime,
        timeRange: lifeTime,
        startSize: 70.0,
        endSize: 1.0,
        spinSpeedRange: 0},
        function(index, parameters) {
          var ring = index / numParticlesPerRing | 0;
          var ndx  = index % numParticlesPerRing;
          var ringOffset = ring / numRings;
          var angle = Math.random() * Math.PI * 2; //(1 / numParticlesPerRing * ringOffset + ndx / numParticlesPerRing) * Math.PI * 2;
          var speed = Math.random() * 10 + 20;
          parameters.spinStart = angle;
          //parameters.startTime = ring / numRings * lifeTime;
          parameters.position = Maths.matrix4.transformPoint(
              Maths.matrix4.rotationZ(angle), [0.05 * -speed, 0, 0])
          parameters.velocity = Maths.matrix4.transformPoint(
              Maths.matrix4.rotationZ(angle), [speed * 0, 0, 0]);
          parameters.acceleration = Maths.matrix4.transformPoint(
              Maths.matrix4.rotationZ(angle), [speed * 0.0, 0, 0]);
        });
    return emitter;
  };

  var createPortalExit = function(particleSystemManager, data) {
    var emitter = particleSystemManager.createParticleEmitter(onePixelTexture.texture);
    emitter.setState(tdl.particles.ParticleStateIds.BLEND);
    var ramp = [];
    var h = (1 + data.tileInfo.teleportDest / 12 - 0.1) % 1;
    addColorToRamp(ramp, h, 0.5,   1, 0.7);
    addColorToRamp(ramp, h,   1,   1, 0.5);
    addColorToRamp(ramp, h, 0.5,   1, 0.0);
    emitter.setColorRamp(ramp);
    emitter.setParameters({
        numParticles: 40,
        lifeTime:  1.0,
        timeRange: 1.0,
        startSize: 0.1,
        endSize: 15.0,
        spinSpeedRange: 0},
        function(index, parameters) {
            var speed = Math.random() * 10 + 20;
            var angle = Math.random() * 2 * Math.PI;
            parameters.position = Maths.matrix4.transformPoint(
                Maths.matrix4.rotationZ(angle), [-0, 0, 0])
            parameters.velocity = Maths.matrix4.transformPoint(
                Maths.matrix4.rotationZ(angle), [speed * 1.3, 0, 0]);
            parameters.acceleration = Maths.matrix4.transformPoint(
                Maths.matrix4.rotationZ(angle), [speed * -0.7, 0, 0]);
        });
    return emitter;
  };

  var Portal = function(services, data, type) {
    setup();
    this.services = services;
    switch (type) {
      case 2:
        this.emitter = createPortalExit(services.particleSystemManager, data);
        break;
      case 1:
        this.emitter = createExit(services.particleSystemManager, data);
        break;
      default:
        this.emitter = createPortal(services.particleSystemManager, data);
        break;
    };

    var level = services.levelManager.getLevel();
    var x = (data.tx + 0.5) * level.tileWidth;
    var y = (data.ty + 0.5) * level.tileHeight;
    this.emitter.setTranslation(x, y, 0);
  };

  return Portal;
});


