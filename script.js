const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const diseaseData = {
  "Tree1": 0.7,
  "leaves1":0.7, // 軽度
  "Tree2": 0.5,// 中度
  "leaves2":0.5
};
function getHeatmapColor(level) {
  // 緑 → 黄 → 赤（level: 0〜1）
  const r = Math.min(2 * level, 1);
  const g = Math.min(2 * (1 - level), 1);
  return new BABYLON.Color3(r, g, 0);
}

const createScene = async () => {
  const scene = new BABYLON.Scene(engine);

  // 環境光とカメラ
  const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 5, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  camera.wheelDeltaPercentage = 0.01; // デフォルトは 0.01（1%）
  camera.lowerBetaLimit = 0.01;             // 真上は0、真下はπ
  camera.upperBetaLimit = Math.PI / 2.2; 
  camera.lowerRadiusLimit = 2;   // ズームインしすぎ防止（距離）
  camera.upperRadiusLimit = 6;  
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);

  // GLB読み込み
  await BABYLON.SceneLoader.AppendAsync("./", "AppleTree.glb", scene);
  // GUIのセットアップ
  const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

// メッシュごとにラベルを作成
  scene.meshes.forEach(mesh => {
   if (mesh.name.startsWith("Tree")) {
    const label = new BABYLON.GUI.Rectangle();
    const level = diseaseData[mesh.name] || 0;
    const baseColor = getHeatmapColor(level);
    label.background = "black";
    label.height = "50px";
    label.alpha = 0.5;
    label.width = "100px";
    label.cornerRadius = 5;
    label.thickness = 1;
    label.color = "white";

    const text = new BABYLON.GUI.TextBlock();
    text.text = `${mesh.name}\n危険度: ${level}`;
    text.color = "white";
    label.addControl(text);

    // 3D位置に固定するラベル
    const labelLink = new BABYLON.GUI.Rectangle();
    advancedTexture.addControl(label);
    label.linkWithMesh(mesh);
    label.linkOffsetY = -100; // ラベルをメッシュの上に少し浮かせる

    };
  if(mesh.name.startsWith("leaves")){
    const level = diseaseData[mesh.name] || 0;
    const baseColor = getHeatmapColor(level);
    if (mesh.material) {
         mesh.material.emissiveColor = new BABYLON.Color3(baseColor.r*0.5, baseColor.g*0.15, baseColor.b*0.15);
        
    };
  }
});
  return scene;
}; 

createScene().then(scene => {
  engine.runRenderLoop(() => {
    scene.render();
  });
});

window.addEventListener("resize", () => {
  engine.resize();
});

scene.meshes.forEach(mesh => {
  console.log("Mesh Name:", mesh.name);
});
