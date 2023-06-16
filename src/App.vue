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
  elevation:300,
  azimuth: 180,
};
const { scene, camera, renderer, controls } = new Threejs({
  el: "app",
  // isAxesHelper: true,
  // orbitControls: true, // 开启  cameraPosition 则无效果
  cameraPosition: [0, 20, 0],
});
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
  _euler.y += movementX * 0.002 * 1.0;
  _euler.x += movementY * 0.002 * 1.0;
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
  document.addEventListener("mousedown", () => {
    document.addEventListener("mousemove", mousermove);
  });
  // 鼠标离开
  document.addEventListener("mouseup", (event) => {
    event.preventDefault();
    document.removeEventListener("mousemove", mousermove);
  });
});



function getRotationAngle() {
  var now = new Date();
  var hour = 5.8 || now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();
  // 计算时针、分针和秒针的旋转角度
  var hourAngle = ((hour % 12 + minute / 60 + second / 3600) * 30) / 2 ; // 每小时30度
  var minuteAngle = (minute + second / 60) * 6;// 每分钟6度
  var secondAngle = second * 6; // 每秒钟6度

  // 返回一个包含三个角度的对象
  return {
    hour: hourAngle,
    minute: minuteAngle,
    second: secondAngle
  };
}

// 使用示例
var rotation = getRotationAngle();
console.log("时针角度：" + rotation.hour);
console.log("分针角度：" + rotation.minute);
console.log("秒针角度：" + rotation.second);


const render = () => {
  renderer.render(scene, camera);
  // 控制器
  controls && controls.update();
  requestAnimationFrame(render);
  water.material.uniforms["time"].value += 1.0 / 60.0;

  // 控制太阳的角度
  const rotation = getRotationAngle();
  parameters.elevation = rotation.hour;
  updateSun();
};
render();
</script>

<template>
  <div></div>
</template>

<style scoped>
</style>
