import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

// 模型加载
export function createObjects(scene, colliders) {
	const loader = new MTLLoader();
	loader.load(
		'model/gallery.glb',
		(gltf) => {
			gltf.scene.traverse((child) => {
				
			});
			scene.add(gltf.scene);
		}
	);
}