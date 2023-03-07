import React from 'react'
import * as THREE from "three";

import fragmentShader from './fragmentShader.glsl';
import vertexShader from './vertexShader.glsl';

import './Section2.css';

export default class Section2 extends React.Component {

    constructor(props) {
        super(props);

        this.scene;
		this.renderer;
        this.camera;

        this.loader;

        this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
        this.material;

        this.mouse = new THREE.Vector2(0, 0);

        this.uniforms;

        this.sizes;
    }

    animate() {
        requestAnimationFrame( this.animate.bind(this) );
        this.renderer.render( this.scene, this.camera );

        this.uniforms.u_time.value += 0.01;
    }

    createMesh() {
		this.mesh = new THREE.Mesh(this.geometry, this.material);

		if (window.innerWidth > window.innerHeight) {
            this.mesh.scale.set(this.size.x, this.size.x, 1);
        } else {
            this.mesh.scale.set(this.size.y, this.size.y, 1);
        }

		this.scene.add(this.mesh);
	}

    getSize(object, size) {
		const { width, height } = object.getBoundingClientRect();
		size.set(width, height);
	}

    handlePointerMove(e) { 
        this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = -( e.clientY / window.innerHeight ) * 2 + 1;
    }

    setUp() {
        this.renderer = new THREE.WebGLRenderer({
			alpha: true,
	    });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.setUpCamera();
    
        this.scene = new THREE.Scene();

        this.setUpLights();
    }

    setUpCamera() {
        this.camera = new THREE.OrthographicCamera( -window.innerWidth/window.innerHeight*window.innerHeight/2, window.innerWidth/window.innerHeight*window.innerHeight/2, window.innerHeight/2, -window.innerHeight/2, -100, 100 );
        this.camera.position.set( 0, 0, 5 );
        this.camera.lookAt( 0, 0, 0 );
    }

    setUpLights() {
        const al = new THREE.AmbientLight(0xffffff, 2);
        this.scene.add(al);
    }

    componentDidMount() {
        this.setUp();

        this.mount.appendChild( this.renderer.domElement );

        this.loader = new THREE.TextureLoader();

        this.$image = document.querySelector('.profile');
        this.size = new THREE.Vector2(0, 0);
        this.getSize(this.$image, this.size);

        this.image = this.loader.load(this.$image.dataset.src, () => {
            //this.image.needsUpdate = true;
            //this.mesh.scale.set(this.sizes.x, this.sizes.y * this.image.image.height / this.image.image.width, 1.0);
            //this.cover(this.image, 1 / 1 );
        });
        //this.image.matrixAutoUpdate = false;
        //this.image.center.set(0.5, 0.75);
		this.hoverImage = this.loader.load(this.$image.dataset.hover, () => {
            //this.cover(this.hoverImage, 1 / 1 );
            //this.hoverImage.needsUpdate = true;
            //this.mesh.scale.set(this.sizes.x, this.sizes.y * this.image.image.height / this.image.image.width, 1.0);
        });
        //this.hoverImage.matrixAutoUpdate = false;
        //this.hoverImage.center.set(0.5, 0.75);
        //this.setRepeat();

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

        this.animate();
    }

    render() {
        return(
            <section className="section2">
                <div>
                    <div className="container">
                        <img data-src="/me_b&w.jpg" data-hover="/me.jpg" className="profile" />
                    </div>

                    <div id="stage" onPointerMove={(e)=> this.handlePointerMove(e)} ref={ref => (this.mount = ref)}></div>
                </div>
            </section>
        );
    }

}