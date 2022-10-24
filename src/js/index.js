import * as THREE from "three";
//import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Scene Creation
const scene = new THREE.Scene();

// Camera Creation
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
//const camera = new THREE.OrthographicCamera(-4, 4, 2.25, -2.25, 1, 1000 )
camera.position.set(0,-2,3)
camera.rotateZ(Math.PI * 0.2)
camera.lookAt(0,0,0)

// Orbit Controls will allow us to control the camera orbiting aroung a target
//const orbit = new OrbitControls(camera, renderer.domElement)

// Player
const playerGeometry = new THREE.BoxGeometry(0.5,0.5,0.2);
const playerMaterial = new THREE.MeshBasicMaterial({color:0xfb5fa0});
const player = new THREE.Mesh(playerGeometry, playerMaterial)
player.position.set(0,0,0.2)
scene.add(player)

// Grid
function tile(x,y,z) {
    const boxGeometry = new THREE.BoxGeometry(1,1,0.2);
    const boxMaterial = new THREE.MeshBasicMaterial({color:0x91F086});
    const box = new THREE.Mesh(boxGeometry, boxMaterial)
    box.position.set (x,y,z)
    scene.add(box);
    return box
}

const tiles = [ 0,
    tile(-1.1,1.1,0),tile(0,1.1,0),tile(1.1,1.1,0),
    tile(-1.1,0,0),tile(0,0,0),tile(1.1,0,0),
    tile(-1.1,-1.1,0),tile(0,-1.1,0),tile(1.1,-1.1,0)
]

// Tiles States
const killColorHex = 0xff3232
const warnColorHex = 0xffb732
const safeColorHex = 0x91F086

const safeColor = new THREE.Color(safeColorHex)
const warnColor = new THREE.Color(warnColorHex)
const killColor = new THREE.Color(killColorHex)

// Tile patterns
const monopatterns = [[1],[2],[3],[4],[5],[6],[7],[8],[9]]
const duopatterns = [[1,3],[1,7],[1,9],[2,8],[3,7],[3,9],[4,6]]
const triopatterns = [[1,2,3], [1,4,7], [1,5,9], [1,8,3], [2,5,8], [2,7,9], [3,6,9],[3,5,7],[4,5,6],[7,8,9]]
const quatropatterns = [[1,3,7,9], [2,4,6,8],[1,2,3,4],[1,2,3,6],[7,8,9,6], [7,8,9,4]]
const quintopatterns = [[1,3,5,7,9], [2,4,5,6,8], [1,2,5,8,9], [1,2,5,8,7], [2,3,5,8,7],[2,3,5,8,9],[1,4,5,6,3],[1,4,5,6,9],[7,4,5,6,3],[7,4,5,6,9]]
const hexapatterns = [[1,2,3,4,5,6], [1,2,3,7,8,9],[4,5,6,7,8,9], [1,4,7,2,5,8], [1,4,7,3,6,9], [2,5,8,3,6,9]]
const octopatterns = [[1,2,3,4,6,7,8,9]]
// possible patterns during the game
const patterns = [...monopatterns, ...duopatterns, ...triopatterns,...quatropatterns,...quintopatterns,...hexapatterns,...octopatterns] 
let patternUsed = [10] // this is a random array value to avoid error when first called

// Modify title states

function intersect(arr1, arr2) { // Checks if pattern intersects with the previous one
    if (arr1.filter(x => arr2.includes(x)).length) {
        return true
    }
    return false ;
}

function pattern(patternArray) {
    if (patternArray == patternUsed || intersect(patternArray, patternUsed)) { // Make sure no pattern repeat or intersects
        pattern(patterns[Math.floor(Math.random() * patterns.length)])
    }
    else {
        patternUsed = patternArray
        for ( let item of patternArray){
            tiles[item].material.color.set(warnColor)
            let kill = setTimeout(()=>{tiles[item].material.color.set(killColor)},1000)
            // 1/10th of a second to escape sticky situations
            let safe = setTimeout(()=>{tiles[item].material.color.set(safeColor); },1900)

            // Harder difficulty
            // let kill = setTimeout(()=>{tiles[item].material.color.set(killColor)},500)
            // // 1/10th of a second to escape sticky situations
            // let safe = setTimeout(()=>{tiles[item].material.color.set(safeColor); },950)
            

        }
    }
}

// Keyboard controls WASD or arrows

document.body.addEventListener("keydown" ,(event)=> {
    if (event.key == 'd' || event.key == 'D' || event.keyCode == 39){
        if (player.position.x < 1.1 ){
            player.position.x += 1.1
        }

    }
    if (event.key == 'a' || event.key == 'A' || event.keyCode == 37 ){
        if (player.position.x > -1.1){
            player.position.x -= 1.1
        }

    }
    if (event.key == 's' || event.key == 'S' || event.keyCode == 40){
        if (player.position.y > -1.1){
            player.position.y -= 1.1
        }

    }
    if (event.key == 'w' || event.key == 'W' || event.keyCode == 38){
        if (player.position.y < 1.1){
            player.position.y += 1.1
        }

    }
})





// Game UI
let gameover = true
let score = -1
let bestScore = 0
let scoreText = document.getElementById('score')
let startText = document.getElementById('start')
let lostText = document.getElementById('lost')
    
// starts game

function initPatterns(){
    if (gameover == false){
        var interval = setInterval(function() {
            pattern(patterns[Math.floor(Math.random() * patterns.length)])
            score++
            scoreText.innerHTML = score
            console.log(`your score is: ${score}`)
        }, 1000);
        
        return interval
    }
}
let interval 

function play(){
    interval = initPatterns()
} 
function start(){
    startText.className = 'hide'
    lostText.className = 'hide' 
    gameover = false
    play()
}
startText.addEventListener('click', ()=>{start()})


function lose() {
    gameover= true
    if (score > bestScore) {
        bestScore = score
    }
    console.log(bestScore)
    score = 0
    
    scoreText.innerHTML = '0'
    startText.className -= 'hide'
    startText.innerHTML = 'Restart'
    lostText.className -= 'hide'
    clearInterval(interval)
}
    
// Check if player on a kill tile
function check() {
    tiles.forEach((tile) => {
        if (tile != 0){
            if (((player.position.x == tile.position.x) && (player.position.y == tile.position.y)) && (tile.material.color.getHex() == killColorHex) && tile != 0) {
                lose()
            }
        }
    })
}

play()




window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

// Rendering
function animate(){
    //orbit.update()
    renderer.render(scene,camera)
    check()
}

renderer.setAnimationLoop(animate)


