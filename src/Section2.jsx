import React from 'react'
import * as THREE from "three";

import fragmentShader from './fragmentShader.glsl';
import vertexShader from './vertexShader.glsl';

import './Section2.css';

export default class Section2 extends React.Component {

    constructor(props) {
        super(props);

        this.scene = new THREE.Scene();
		
        this.renderer = new THREE.WebGLRenderer({
			alpha: true,
	    });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.loader = new THREE.TextureLoader();

        this.mouse = new THREE.Vector2(0, 0);
        this.size = new THREE.Vector2(0, 0);
    }

    animate() {
        requestAnimationFrame( this.animate.bind(this) );
        this.renderer.render( this.scene, this.camera );

        this.uniforms.u_time.value += 0.01;
    }

    createMesh() {
		this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), this.material);

		this.setSize();

		this.scene.add(this.mesh);
	}

    getSize(object, size) {
		const { width, height } = object.getBoundingClientRect();
		size.set(width, height);
	}

    handleDeviceOrientation(e) {
        let x = e.beta; // In degree in the range [-180,180)
        let y = e.gamma; // In degree in the range [-90,90)
    
        //Constrain the x value to the range [-90,90]
        if (x > 90) {
            x = 90;
        }
        if (x < -90) {
            x = -90;
        }
        if (y > 90) {
            y = 90;
        }
        if (y < -90) {
            y = -90;
        }

        this.mouse.x = ( (y + 45) / 90 ) * 2 - 1;
        this.mouse.y = -( (x + 45) / 90 ) * 2 + 1;
        console.log(( y / 90 ) * 2 - 1, -( x / 90 ) * 2 + 1);
    }

    handleMouseMove(e) {
        this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = -( (e.clientY - e.target.getBoundingClientRect().top) / window.innerHeight ) * 2 + 1;
    }

    handleResize() {  
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.setUpCamera();
        this.setUpImage();
    }

    setSize() {
        if (window.innerWidth > window.innerHeight) {
            this.mesh.scale.set(this.size.x, this.size.x, 1);
        } else {
            this.mesh.scale.set(this.size.y, this.size.y, 1);
        }
    }

    setUp() {
        this.setUpCamera();
        this.setUpLights();
    }

    setUpCamera() {
        this.camera = new THREE.OrthographicCamera( -window.innerWidth/window.innerHeight*window.innerHeight/2, window.innerWidth/window.innerHeight*window.innerHeight/2, window.innerHeight/2, -window.innerHeight/2, -100, 100 );
        this.camera.position.set( 0, 0, 5 );
        this.camera.lookAt( 0, 0, 0 );
    }

    setUpImage() {
        this.$image = document.querySelector('.profile');
        this.getSize(this.$image, this.size);

        this.image = this.loader.load(this.$image.dataset.src);
		this.hoverImage = this.loader.load(this.$image.dataset.hover);

        this.uniforms = {
            u_image: { type: 't', value: this.image },
            u_imagehover: { type: 't', value: this.hoverImage },
            u_mouse: { value: this.mouse },
            u_time: { value: 0 },
            u_res: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        }
        
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            defines: {
                 PR: window.devicePixelRatio.toFixed(1)
            }
        });

		this.createMesh();
    }

    setUpLights() {
        const al = new THREE.AmbientLight(0xffffff, 2);
        this.scene.add(al);
    }

    componentDidMount() {
        this.setUp();

        this.mount.appendChild( this.renderer.domElement );

        this.setUpImage();

        this.animate();

        window.addEventListener("deviceorientation", this.handleDeviceOrientation.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    render() {
        return(
            <section className="section2">
                <div>
                    <div className="container">
                        <img data-src="/me_b&w.jpg" data-hover="/me.jpg" className="profile" />
                    </div>

                    <div id="stage" onMouseMove={(e)=> this.handleMouseMove(e)} ref={ref => (this.mount = ref)}></div>
                </div>
            </section>
        );
    }

}
