import React from 'react'
import * as THREE from "three";

import './Section1.css'

import Infobar from './Infobar'

export default class Section1 extends React.Component {

    constructor(props) {
        super(props);

        this.scene;
        this.camera;
        this.renderer;

        this.side = 100;
        this.h = this.side * (Math.sqrt(3)/2);
        this.gap = 5;
 
        this.meshes = [];

        this.pointer = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        this.state = {
            closeInfobar: false,
            showInfobar: false
        };
        this.handleDeviceOrientationEvent = false;

        this.handleCloseInfobar = this.handleCloseInfobar.bind(this);
    }

    animate() {
        requestAnimationFrame( this.animate.bind(this) );
        this.renderer.render( this.scene, this.camera );
    }

    colorLogo() {
        const rand_row = Math.floor(Math.random() * (this.meshes.length - 3 + 1) + 2) - 1;
        const rand_col = Math.floor(Math.random() * (this.meshes[0].length - 4 - 2 + 1) + 2) - 1;
        let meshesChanged = 0;
    
        let i = rand_col - 1;
    
        while (meshesChanged < 3) {
            let curr_mesh = this.meshes[rand_row][i];
            
            if (curr_mesh.isUp && meshesChanged === 0) {
                curr_mesh.material.color.setHex(0xffffff);
                meshesChanged++;
            } else if(!curr_mesh.isUp && meshesChanged !== 0) {
                curr_mesh.material.color.setHex(0xffffff);
                meshesChanged++;
            }
    
            if (i === 2) {
                //light.position.set(curr_mesh.position.x, curr_mesh.position.y, 50);
            }
            i++;
        }
    }

    degrees_to_radians(degrees) {
        var pi = Math.PI;
        return degrees * (pi/180);
      }

    drawTriangle(side, h, isUp) {
        const shape = new THREE.Shape();
    
        if (isUp) {
            shape.moveTo(0, h / 2);
            shape.lineTo(side / 2, -h / 2);
            shape.lineTo(-side / 2, -h / 2);
            shape.lineTo(0, h / 2);
        } else {
            shape.moveTo(0, -h / 2);
            shape.lineTo( -side / 2, h / 2);
            shape.lineTo(side / 2, h / 2);
            shape.lineTo(0, -h / 2);
        }
    
        return new THREE.ShapeGeometry(shape); 
    }

    drawTriangles() {
        for (let j = 0, y = -window.innerHeight / 2; y < window.innerHeight / 2 + this.h; j++, y += this.h + this.gap) {
            let row = [];
            for (let i = 0, x = -window.innerWidth / 2; x < window.innerWidth / 2 + this.side; i++, x += this.side/2 + this.gap / (Math.sqrt(3)/2)) {   
                const triangleGeometry = this.drawTriangle(this.side, this.h, (i+j) % 2 === 0);
                const material = new THREE.MeshStandardMaterial({color: 0x000000,
                    metalness: 0,
                    roughness: 1
                });
                const mesh = new THREE.Mesh(triangleGeometry, material);
                mesh.isUp = (i+j) % 2 === 0;
                mesh.geometry.computeBoundingBox();
                const base = mesh.clone();
                base.visible = false;
                const group = new THREE.Group();
                group.add(mesh);
                row.push(mesh);
                group.add(base);
                group.position.set(x, y, 0);
                this.scene.add(group);
            }
            this.meshes.push(row);
        }
    
        this.colorLogo();
    }

    handleCloseInfobar() {
        this.setState({
            closeInfobar: true
        });
    }

    handleDeviceOrientation(e) {
        this.handleDeviceOrientationEvent = true;

        if (!this.state.closeInfobar) {
            this.handleCloseInfobar();
        }

        const denominator = 2;

        let x = e.beta; // In degree in the range [-180,180)
        let y = e.gamma; // In degree in the range [-90,90)
    
        // Constrain the x value to the range [-90,90]
        // if (x > 90) {
        //     x = 90;
        // }
        // if (x < -90) {
        //     x = -90;
        // }
        // if (y > 90) {
        //     y = 90;
        // }
        // if (y < -90) {
        //     y = -90;
        // }

        this.scene.traverse(element => {
            if (element.type !== "Mesh") return;
            
            element.rotation.x = this.degrees_to_radians(x/denominator);
            element.rotation.y = this.degrees_to_radians(y/denominator);
        });
    }

    handleDeviceOrientationPermission() {
        DeviceMotionEvent.requestPermission()
        .then(function response() {
            if (response == "granted") {
                window.addEventListener("deviceorientation", handleDeviceOrientation);
            }
        }.bind(this))
        .catch( console.error );
    }

    handleMouseMove(e) { 
        this.resetRotation();

        this.pointer.x = ( e.pageX / window.innerWidth ) * 2 - 1;
        this.pointer.y = -( e.pageY / window.innerHeight ) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.camera);

        const intersects = this.raycaster.intersectObjects(this.scene.children);
        
        if (intersects.length === 0) return;

        const base = intersects[intersects.length-1].object;
        const mesh = base.parent.children[0];
        const point = intersects[intersects.length-1].point;

        mesh.rotation.x = (point.y - base.parent.position.y) / this.side * -1;
        mesh.rotation.y = (point.x - base.parent.position.x) / this.h;
    }

    handleResize() {
        while(this.scene.children.length > 0){ 
            this.scene.remove(this.scene.children[0]); 
        }
    
        this.meshes = [];
        
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setPixelRatio(window.devicePixelRatio);
    
        this.setUpCamera();
        this.drawTriangles();
        this.setUpLights();
        this.animate();
    }

    resetRotation() {
        this.scene.traverse(element => {
            if (element.type !== "Mesh") return;
            
            element.rotation.x = 0;
            element.rotation.y = 0;
        });
    }

    setUp() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
    
        this.setUpCamera();
    
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x333333);

        this.setUpLights();
    }

    setUpCamera() {
        this.camera = new THREE.OrthographicCamera( -window.innerWidth/window.innerHeight*window.innerHeight/2, window.innerWidth/window.innerHeight*window.innerHeight/2, window.innerHeight/2, -window.innerHeight/2, -100, 100 );
        this.camera.position.set( 0, 0, 5 );
        this.camera.lookAt( 0, 0, 0 );
    }

    setUpLights() {
        const light = new THREE.PointLight(0xffffff);
        this.scene.add(light);

        const al = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(al);
    }

    componentDidMount() {
        this.setUp();
        this.drawTriangles();

        this.animate();

        this.mount.appendChild( this.renderer.domElement );

        window.addEventListener("deviceorientation", this.handleDeviceOrientation.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
        screen.addEventListener('orientationchange', this.handleResize.bind(this));

        setTimeout(() => {
            if(!this.handleDeviceOrientationEvent) {
                this.setState({
                    showInfobar: true
                });
            }
          }, "500");
    }

    render() {
        return (
            <section>
                {(typeof( DeviceOrientationEvent ) !== "undefined" && typeof( DeviceOrientationEvent.requestPermission ) === "function" && !this.state.closeInfobar && this.state.showInfobar ) && <Infobar handleCloseInfobar={this.handleCloseInfobar} handleDeviceOrientationPermission={this.handleDeviceOrientationPermission} />}
                <div className="section1" onMouseMove={(e)=> this.handleMouseMove(e)} ref={ref => (this.mount = ref) }  />
            </section>
        );
    }
}
