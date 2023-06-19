<script setup>
import { effect, onMounted, ref } from "vue";
import * as THREE from "three";
import { Threejs } from "./hooks/index";
import { GUI } from "./hooks/gui.js";
import { Water } from "three/examples/jsm/objects/Water";
import { Sky } from "three/examples/jsm/objects/Sky";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

let sun = new THREE.Vector3();
let water = null;
const sky = new Sky();
const parameters = {
  elevation: 300,
  azimuth: 180,
};
const { scene, camera, renderer, controls } = new Threejs({
  el: "app",
  isAxesHelper: true,
  orbitControls: true, // 开启  cameraPosition 则无效果
  cameraPosition: [20, 0, 100],
});

controls.target.set(0, 3, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping; // 渲染器会使用该算法对渲染的图像进行色彩映射，以产生更加真实和逼真的视觉效果。
renderer.toneMappingExposure = 0.5; // 用于设置渲染器的色调映射曝光值


// 创建天空盒
const createSky = () => {
  sky.scale.setScalar(10000);
  scene.add(sky);
  const skyUniforms = sky.material.uniforms;
  skyUniforms["turbidity"].value = 10;
  skyUniforms["rayleigh"].value = 2;
  skyUniforms["mieCoefficient"].value = 0.005;
  skyUniforms["mieDirectionalG"].value = 0.8;

};
createSky();

// 创建 海面
const createWater = () => {
  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      "textures/waternormals.jpg",
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    ),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f, // 太阳光的颜色
    distortionScale: 3.7,
    fog: scene.fog !== undefined,
  });
  water.material.uniforms["sunDirection"].value.copy(sun).normalize();
  water.rotation.x = -Math.PI / 2;
  scene.add(water);
};
createWater();

function updateSun() {
  const phi = THREE.MathUtils.degToRad(parameters.elevation);
  const theta = THREE.MathUtils.degToRad(parameters.azimuth);
  sun.setFromSphericalCoords(1, phi, theta);
  sky.material.uniforms["sunPosition"].value.copy(sun);
  water.material.uniforms["sunDirection"].value.copy(sun).normalize();
}
updateSun();

const createSpotLight = () => {
  var spotLight1 = new THREE.SpotLight(0xffffff);
  spotLight1.position.set(-50, 100, 0);
  scene.add(spotLight1);

  var spotLight2 = new THREE.SpotLight(0xffffff);
  spotLight2.position.set(550, 500, 0);
  scene.add(spotLight2);

  var spotLight3 = new THREE.SpotLight(0xffffff);
  spotLight3.position.set(150, 50, -200);
  scene.add(spotLight3);

  var spotLight4 = new THREE.SpotLight(0xffffff);
  spotLight4.position.set(150, 50, 200);
  scene.add(spotLight4);

  var spotLight5 = new THREE.SpotLight(0xffffff);
  spotLight5.position.set(-500, 10, 0);
  scene.add(spotLight5);
};
createSpotLight();
// 加载船模型
const createMTLLoader = () => {
  let createLoader = new MTLLoader();
  createLoader.load("/objs/工程船.mtl", (materials) => {
    var objLoader = new OBJLoader();
    materials.preload();
    objLoader.setMaterials(materials);
    objLoader.load("objs/工程船.obj", function (object) {
      object.position.x = -60;
      object.position.z = -80;
      object.position.y = 0;
      object.scale.set(0.005, 0.005, 0.005);
      object.name = "engineerShip";
      scene.add(object);
    });
  });
};
createMTLLoader();

//设置相机的旋转
const setFromEuler = (movementX, movementY, camera) => {
  const _euler = new THREE.Euler(0, 0, 0, "YXZ");
  _euler.setFromQuaternion(camera.quaternion);
  _euler.y += movementX * 0.002 * 1.0 ;
  _euler.x += movementY * 0.002 * 1.0 ;
  _euler.x = Math.max(
    Math.PI / 2 - Math.PI,
    Math.min(Math.PI / 2 - 0, _euler.x)
  );
  camera.quaternion.setFromEuler(_euler);
};

// 鼠标移动
const mousermove = (event) => {
  event.preventDefault();
  const movementX =
    event.movementX || event.mozMovementX || event.webkitMovementX || 0;
  const movementY =
    event.movementY || event.mozMovementY || event.webkitMovementY || 0;
  setFromEuler(movementX, movementY, camera);
};

onMounted(() => {
  // 鼠标按下
  // document.addEventListener("mousedown", () => {
  //   document.addEventListener("mousemove", mousermove);
  // });
  // // 鼠标离开
  // document.addEventListener("mouseup", (event) => {
  //   event.preventDefault();
  //   document.removeEventListener("mousemove", mousermove);
  // });
});

// 返回几点钟的时间戳
const dateTime = (hour, minute, second) => {
  const sixAM = new Date();
  sixAM.setHours(hour);
  return sixAM.getTime();
};

// 计算角度
const linearInterpolation = (
  value = dateTime(10),
  startValue = dateTime(6),
  endValue = dateTime(19),
  startRange = 92.4,
  endRange = -92.4
) => {
  if (value < startValue) {
    return startRange;
  }
  if (value > endValue) {
    return endRange;
  }
  var range = endRange - startRange;
  var relativePosition = (value - startValue) / (endValue - startValue);
  var interpolatedValue = startRange + relativePosition * range;
  return interpolatedValue;
};

// 创建罗盘的指针
var pointerGeometry = new THREE.PlaneGeometry(0.2, 2); // 指针的几何体
var pointerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // 指针的材质
var pointer = new THREE.Mesh(pointerGeometry, pointerMaterial); // 创建指针的网格对象

// 设置指针的初始位置和旋转
pointer.position.set(20, 0, -15); // 设置指针的位置
pointer.rotation.z = Math.PI / 4; // 设置指针的初始旋转角度

// 添加指针到场景中
scene.add(pointer);




const render = () => {
  renderer.render(scene, camera);
  // 控制器
  controls && controls.update();
  requestAnimationFrame(render);
  water.material.uniforms["time"].value += 1.0 / 60.0;

  // 获取太阳旋转的角度
  const now = new Date();
  const interpolatedValue = linearInterpolation(
    dateTime(now.getHours(), now.getMinutes(), now.getSeconds())
  );
  parameters.elevation = interpolatedValue;
  updateSun();
};
render();
</script>

<template>
  <div></div>
</template>

<style scoped>
</style>
