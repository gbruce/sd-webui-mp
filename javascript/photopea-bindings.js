/* Setup and navigation */
var photopeaWindow = null;
var photopeaIframe = null;
var mpSdk = null;
var THREE = null;
var path = null;
var onOpacityChangedPath = null;
var onPurgedPath = null;
const sweepMap = {};
let globalOpacity = 1;
let globalSceneObject = null;

const renderToTexture = (renderer, THREE, texture, sweepY, poseY) => {
  const renderTarget = new THREE.WebGLCubeRenderTarget(2048, {
    format: THREE.RGBAFormat,
    generateMipmaps: false,
    depthBuffer: false,
    stencilBuffer: false,
  });
  const scene = new THREE.Scene();

  const material = new THREE.MeshBasicMaterial( {
    map: null,
    side: THREE.BackSide,
    transparent: true,
    opacity: globalOpacity,
    map: texture,
  });

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry( 100 ),
    material,
  );
  console.log(`pose y`, poseY);
  console.log(`sweep y`, sweepY);
  mesh.rotateY(THREE.MathUtils.degToRad(-90+sweepY+poseY));
  mesh.scale.set(-1,1,1);

  scene.add( mesh );
  const camera = new THREE.CubeCamera( 1, 100, renderTarget );

  camera.update( renderer, scene );;
  camera.renderTarget.texture.image.width = 2048;
  camera.renderTarget.texture.image.height = 2048;

  return camera.renderTarget;
};

class TestComponent {
	constructor(sdk){
		this.sdk = sdk;
    this.events = {
      onBlob: true,
      onOpacityChanged: true,
      onPurged: true,
    };
    this.onInputsChanged = this.onInputsChanged.bind(this);
    this.onInit = this.onInit.bind(this);
    this.onEvent = this.onEvent.bind(this);
	}

  async onEvent(type, data) {
    const THREE = this.context.three;
    const renderer = this.context.renderer;
	const scene = this.context.scene;

    console.log('onEvent', type, data);
    if (type === 'onBlob') {  
      let sweep;
      let rotation = new THREE.Quaternion();
      await this.sdk.Sweep.current.waitUntil((current) => {
        console.log(current);
        sweep = current;

        const euler = new THREE.Euler(current.rotation.x, current.rotation.y, current.rotation.z);
        rotation.setFromEuler(euler);
        return true;
      });

      let poseY, sweepY;
	  let position;
      await this.sdk.Camera.pose.waitUntil((currentPose) => {
        poseY = currentPose.rotation.y;
        sweepY = sweep.rotation.y;
		position = sweep.position;
        return true;
      });
      new THREE.TextureLoader().load(data, async ( texture ) => {
        const renderTarget = renderToTexture(renderer, THREE, texture, sweepY, poseY);
        await this.sdk.Renderer.renderOverlay(sweep.id, renderTarget.texture);

        if (sweepMap[sweep.id]) {
          sweepMap[sweep.id].texture.dispose();
          sweepMap[sweep.id].renderTarget.dispose();
          sweepMap[sweep.id].texture = null;
          sweepMap[sweep.id].renderTarget = null;
        }
        else {
          sweepMap[sweep.id] = {
            texture: null,
            renderTarget: null,
          };
        }

        sweepMap[sweep.id].texture = texture;
        sweepMap[sweep.id].renderTarget = renderTarget;
        sweepMap[sweep.id].poseY = poseY;
        sweepMap[sweep.id].sweepY = sweepY;
      });
    }
    else if(type === 'onOpacityChanged') {
      globalOpacity = data;
      const keys = Object.keys(sweepMap);
      keys.forEach(async (key) => {
        const overlay = sweepMap[key];
        overlay.renderTarget.dispose();
        overlay.renderTarget = renderToTexture(renderer, THREE, overlay.texture, overlay.sweepY, overlay.poseY);
        await this.sdk.Renderer.renderOverlay(key, overlay.renderTarget.texture);
      });
    }
    else if(type === 'onPurged') {
      for(const sid in sweepMap) {
        const overlay = sweepMap[sid];
        overlay.texture.dispose();
        overlay.texture = null;
        overlay.renderTarget.dispose();
        overlay.renderTarget = null;
        delete sweepMap[sid];
      }
    }
  }

	onInputsChanged() {
		console.log('onInputsChanged');
	}

	onInit() {
    	console.log('onInit');

    	this.sdk.on(this.sdk.Sweep.Event.EXIT, (fromSweep, toSweep) => {
      		console.log('Swep.EXIT', fromSweep, toSweep);
      		if(sweepMap[toSweep] && sweepMap[toSweep].renderTarget) {
        		this.sdk.Renderer.renderOverlay(toSweep, sweepMap[toSweep].renderTarget.texture);
      		}
    	});
	}
}

const factory = (sdk) => {
return () => new TestComponent(sdk);
};

const loadScript = (FILE_URL, async = true, type = "text/javascript") => {
	return new Promise((resolve, reject) => {   
		try {
			const scriptEle = document.createElement("script");
			scriptEle.type = type;
			scriptEle.async = async;
			scriptEle.src =FILE_URL;

			scriptEle.addEventListener("load", (ev) => {
				resolve({ status: true });
			});

			scriptEle.addEventListener("error", (ev) => {
				reject({
					status: false,
					message: `Failed to load the script ＄{FILE_URL}`
				});
			});

			document.body.appendChild(scriptEle);
		} catch (error) {
			reject(error);
		}
	});
};

async function onMatterportLoaded(iframe) {
	mpSdk = await iframe.contentWindow.MP_SDK.connect(iframe);
	console.log(mpSdk);
	await mpSdk.Scene.registerComponents([
		{ name: 'test', factory: factory(mpSdk)},
	]);

	await mpSdk.Scene.configure((renderer, threeInstance, effectComposer) => {
		THREE = threeInstance;
	});

	globalSceneObject = (await mpSdk.Scene.createObjects(1))[0];
	const node = globalSceneObject.addNode();
	const component = node.addComponent('test');
	node.addComponent('mp.lights');
	globalSceneObject.start();
	path = globalSceneObject.addEventPath(component, 'onBlob');
	onOpacityChangedPath = globalSceneObject.addEventPath(component, 'onOpacityChanged');
	onPurgedPath = globalSceneObject.addEventPath(component, 'onPurged');
	photopeaWindow = iframe.contentWindow;
	photopeaIframe = iframe;

	// Clone some buttons to send the contents of galleries in txt2img, img2img and extras tabs
	// to Photopea. You can also just copy-paste the images directly but these are the ones I
	// use the most.
	createSendToPhotopeaButton("image_buttons_txt2img", txt2img_gallery);
	createSendToPhotopeaButton("image_buttons_img2img", img2img_gallery);
	createSendToPhotopeaButton("image_buttons_extras", extras_gallery);

  gradioApp().getElementById("overlayOpacitySlider").addEventListener('mouseup', (event) => {
		const newOpacity = parseFloat(event.target.value);
    onOpacityChangedPath.emit(newOpacity);
	});

  gradioApp().getElementById("loadSpaceButton").addEventListener('click', (event) => {
    const input = gradioApp().querySelector("#modelSidInput textarea");
    const string = `/file=extensions/sd-webui-mp/bundle/showcase.html?m=${input.value}&qs=1&play=1&useLegacyIds=0&vr=0&applicationKey=08s53auxt9txz1w6hx2iww1qb`;

    onPurgedPath.emit();
    globalSceneObject.stop();

    const iframe = gradioApp().querySelector('#webui-photopea-iframe');
    iframe.src = string;
  });
}

// Creates a button in one of the WebUI galleries that will get the currently selected image in the 
// gallery.
// `queryId`: the id for the querySelector to search for the specific gallery list of buttons.
// `gallery`: the gallery div itself (cached by WebUI).
function createSendToPhotopeaButton(queryId, gallery) {
	console.log('createSendToPhotopeaButton');

  const searchForElement = gradioApp().querySelector(`#${queryId}_open_in_photopea`);
  if (searchForElement) {
    return;
  }
	const existingButton = gradioApp().querySelector(`#${queryId} button`);
	const newButton = existingButton.cloneNode(true);
	gradioApp().querySelector(`#${queryId}`).appendChild(newButton);
	newButton.id = `${queryId}_open_in_photopea`;
	newButton.textContent = "Send to Mttr";
	newButton.addEventListener("click", () => openImageInPhotopea(gallery));
}

// Switches to the "Photopea" tab by finding and clicking on the DOM button.
function goToMatterportTab() {
	console.log('goToMatterportTab');
	// Find Photopea tab button, as we don't know which order it might appear in.
	const allButtons = gradioApp().querySelectorAll('#tabs button');
	// The space after the name seems to be added automatically for some reason, so this is likely
	// flaky across versions. We can't use "contains" because there's also "Send to Photopea"
	// buttons.
	photopeaTabButton = Array.from(allButtons).find(button => button.textContent === 'Matterport ');
	photopeaTabButton.click();
}

// Navigates the UI to the "Inpaint Upload" tab under the img2img tab.
// Gradio will destroy and recreate parts of the UI when swapping tabs, so we wait for the page to
// be refreshed before trying to find the relevant bits.
function goToImg2ImgInpaintUpload(onFinished) {
	// Start by swapping to the img2img tab.
	switch_to_img2img();
	const img2imgdiv = gradioApp().getElementById("mode_img2img");

	waitForWebUiUpdate(img2imgdiv).then(() => {
		const allButtons = img2imgdiv.querySelectorAll("div.tab-nav > button");
		const inpaintButton =
			Array.from(allButtons).find(button => button.textContent === 'Inpaint upload ');
		inpaintButton.click();
		onFinished();
	});
}

/* Image transfer functions */

// Returns true if the "Active Layer Only" checkbox is ticked, false otherwise.
function activeLayerOnly() {
	return gradioApp()
		.getElementById("photopea-use-active-layer-only")
		.querySelector("input[type=checkbox]").checked;
}

// Gets the currently selected image in a WebUI gallery and opens it in Photopea.
function openImageInPhotopea(originGallery) {
	console.log('openImageInPhotopea');
	var imageSizeMatches = true;
	const outgoingImg = originGallery.querySelectorAll("img")[0];
	goToMatterportTab();

  path.emit(outgoingImg.src);

  blobTob64(outgoingImg.src, (imageData) => {

	});
  return;
	// First, check the image size to see if we have matching sizes. If it's bigger, we open it
	// as a new document. Otherwise, we just append it to the current document as a new layer.
	postMessageToPhotopea(getPhotopeaScriptString(getActiveDocumentSize)).then((response) => {
		const activeDocSize = response[0].split(",");
		if (outgoingImg.naturalWidth > activeDocSize[0] || 
			outgoingImg.naturalHeight > activeDocSize[1]) {
			imageSizeMatches = false;
		}

		blobTob64(outgoingImg.src, (imageData) => {
			// Actually open the image, passing `imageSizeMatches` into Photopea's "open as new document" parameter.
			postMessageToPhotopea(`app.open("${imageData}", null, ${imageSizeMatches});`, "*")
				.then(() => {
					if (imageSizeMatches) {
						postMessageToPhotopea(`app.activeDocument.activeLayer.rasterize();`, "*");
					} else {
						postMessageToPhotopea(
							`alert("New document created as the image sent is bigger than the active document");`,
							"*");
					}
				});
		});

	});
}

// Requests the image from Photopea, converts the array result into a base64 png, then a blob, then
// actually send it to the WebUI.
function getAndSendImageToWebUITab(webUiTab, sendToControlnet, imageWidgetIndex) {
	console.log('getAndSendImageToWebUITab');
	// Photopea only allows exporting the whole image, so in case "Active layer only" is selected in
	// the UI, instead of just requesting the image to be saved, we also make all non-selected
	// layers invisible.
	const saveMessage = activeLayerOnly()
		? getPhotopeaScriptString(exportSelectedLayerOnly)
		: 'app.activeDocument.saveToOE("png");';

	postMessageToPhotopea(saveMessage)
		.then((resultArray) => {
			// The first index of the payload is an ArrayBuffer of the image. We convert that to
			// base64 string, then to blob, so it can be sent to a specific image widget in WebUI.
			// There's likely a direct ArrayBuffer -> Blob conversion, but we're already using b64
			// as an intermediate format.
			const base64Png = base64ArrayBuffer(resultArray[0]);
			sendImageToWebUi(
				webUiTab,
				sendToControlnet,
				imageWidgetIndex,
				b64toBlob(base64Png, "image/png"));
		});
}

async function getAndSendImageToWebUITab(webUiTab, sendToControlnet, imageWidgetIndex) {
	console.log('getAndSendImageToWebUITab');
	const screenshot = await mpSdk.Renderer.takeEquirectangular();
	const split = screenshot.split('data:image/jpg;base64,');
  // const blob = b64toBlob(split[1], "image/jpg");
  // const url = URL.createObjectURL(blob);
  // const file = new File([blob], "tmp.png");
  // path.emit(url);

 	sendImageToWebUi(webUiTab, sendToControlnet, imageWidgetIndex, b64toBlob(split[1], "image/jpg"));
	// Photopea only allows exporting the whole image, so in case "Active layer only" is selected in
	// the UI, instead of just requesting the image to be saved, we also make all non-selected
	// layers invisible.
	const saveMessage = activeLayerOnly()
		? getPhotopeaScriptString(exportSelectedLayerOnly)
		: 'app.activeDocument.saveToOE("png");';

	postMessageToPhotopea(saveMessage)
		.then((resultArray) => {
			// The first index of the payload is an ArrayBuffer of the image. We convert that to
			// base64 string, then to blob, so it can be sent to a specific image widget in WebUI.
			// There's likely a direct ArrayBuffer -> Blob conversion, but we're already using b64
			// as an intermediate format.
			const base64Png = base64ArrayBuffer(resultArray[0]);
			sendImageToWebUi(
				webUiTab,
				sendToControlnet,
				imageWidgetIndex,
				b64toBlob(base64Png, "image/png"));
		});
}
// Send image to a specific image widget in a Web UI tab. This basically navigates the DOM graph via
// queries, and magically presses buttons. You web developers sure work some dark magic.
function sendImageToWebUi(webUiTab, sendToControlNet, controlnetModelIndex, blob) {
	console.log('sendImageToWebUi');
	const file = new File([blob], "photopea_output.png")

	switch (webUiTab) {
		case "txt2img":
			switch_to_txt2img();
			break;
		case "img2img":
			switch_to_img2img();
			break;
		case "extras":
			switch_to_extras();
			break;
	}

	if (sendToControlNet) {
		// First, select the ControlNet accordion div.
		const tabId = webUiTab === "txt2img"
			? "#txt2img_script_container"
			: "#img2img_script_container";
		const controlNetDiv = gradioApp().querySelector(tabId).querySelector("#controlnet");
		// Check if the ControlNet accordion is open by finding the image editing iFrames.
		setImageOnControlNetInput(controlNetDiv, controlnetModelIndex, file);
	} else {
		// For regular tabs, it's less involved - we can simply set the image on input directly.
		const imageInput = gradioApp().getElementById(`mode_${webUiTab}`).querySelector("input[type='file']");
		setImageOnInput(imageInput, file);
	}
}

// I couldn't figure out a way to inject a mask directly on an image widget. So to have an easy way
// of masking inpainting via selection, we send the image to "Inpaint Upload", and create a mask
// from selection.
function sendImageWithMaskSelectionToWebUi() {
	console.log('sendImageWithMaskSelectionToWebUi');
	// Start by verifying if there actually is a selection in the document.
	postMessageToPhotopea(getPhotopeaScriptString(selectionExists))
		.then((response) => {
			if (response[0] === false) {
				// In case there isn't, do an in-photopea alert (which is less intrusive but more
				// visible).
				postMessageToPhotopea(`alert("No selection in active document!");`);
			} else {
				// Let's start by swapping to the correct tab. This is a bit more involved due to
				// Gradio's reconstruction of disabled UI elements.
				goToImg2ImgInpaintUpload(() => {
					// In case there is a selection, we'll pass a whole script payload to Photopea
					// to create the mask and export it.
					const fullMessage =
						getPhotopeaScriptString(createMaskFromSelection) + // 1. Create the mask
						getPhotopeaScriptString(exportSelectedLayerOnly) + // 2. Function that exports the image
						`app.activeDocument.activeLayer.remove();`;        // 3. Removes the temp mask layer

					postMessageToPhotopea(fullMessage).then((resultArray) => {
						// Set the mask.
						const base64Png = base64ArrayBuffer(resultArray[0]);
						const maskInput = gradioApp().getElementById("img_inpaint_mask").querySelector("input");
						const blob = b64toBlob(base64Png, "image/png");
						const file = new File([blob], "photopea_output.png");
						setImageOnInput(maskInput, file);

						// Now go in and get the actual image.
						const saveMessage = activeLayerOnly()
							? getPhotopeaScriptString(exportSelectedLayerOnly)
							: 'app.activeDocument.saveToOE("png");';

						postMessageToPhotopea(saveMessage)
							.then((resultArray) => {
								const base64Png = base64ArrayBuffer(resultArray[0]);
								const baseImgInput = gradioApp().getElementById("img_inpaint_base").querySelector("input");
								const blob = b64toBlob(base64Png, "image/png");
								const file = new File([blob], "photopea_output.png");
								setImageOnInput(baseImgInput, file);
							});
					});
				});
			}
		});
}

// Navigates to the correct ControlNet model tab, then sets the image.
function setImageOnControlNetInput(controlNetDiv, controlNetModelIndex, file) {
	console.log('setImageOnControlNetInput');
	// If we can't find any iframes, the ControlNet accordion is closed.
	var iframes = controlNetDiv.querySelectorAll("iframe");
	if (iframes.length == 0) {
		// The accordion is not open. Find the little icon arrow and click it (yes, if the arrow
		// ever changes, this will break).
		controlNetDiv.querySelector("span.icon").click();
	}
	waitForWebUiUpdate(controlNetDiv).then(() => {
		// When more than one Controlnet model is enabled in the WebUI settings, there will be a
		// series of Controlnet tabs. The one selected in the dropdown will be passed in by the
		// `controlnetModelIndex`.
		const tabs = controlNetDiv.querySelectorAll("div.tab-nav > button");
		if (tabs !== null && tabs.length > 1) {
			tabs[controlNetModelIndex].click();
		}

		imageInput = controlNetDiv.querySelectorAll("input[type='file']")[controlNetModelIndex];
		setImageOnInput(imageInput, file);
	}
	);
}

// Gradio's image widgets are inputs. To set the image in one, we set the image on the input and
// force it to refresh.
function setImageOnInput(imageInput, file) {
	// Createa a data transfer element to set as the data in the input.
	const dt = new DataTransfer();
	dt.items.add(file);
	const list = dt.files;

	// Actually set the image in the image widget.
	imageInput.files = list;

	// Foce the image widget to update with the new image, after setting its source files.
	const event = new Event('change', {
		'bubbles': true,
		"composed": true
	});
	imageInput.dispatchEvent(event);
}

// Transforms a JS function body into a string that can be passed as a message to Photopea.
function getPhotopeaScriptString(func) {
	return func.toString() + `${func.name}();`
}

// Posts a message and receives back a promise that will eventually return a 2-element array. One of
// them will be Photopea's "done" message, and the other the actual payload.
async function postMessageToPhotopea(message) {
	console.log('postMessageToPhotopea');
	var request = new Promise(function (resolve, reject) {
		var responses = [];
		var photopeaMessageHandle = function (response) {
			responses.push(response.data);
			// Photopea will first return the resulting data as a message to the parent window, then
			// another message saying "done". When we receive the latter, we fulfill the promise.
			if (response.data == "done") {
				window.removeEventListener("message", photopeaMessageHandle);
				resolve(responses)
			}
		};
		// Add a listener to wait for Photopea's response messages.
		window.addEventListener("message", photopeaMessageHandle);
	});
	// Actually execute the request to Photopea.
	photopeaWindow.postMessage(message, "*");
	return await request;
}

// Returns a promise that will be resolved when the div passed in the parameter is modified.
// This will happen when Gradio reconstructs the UI after, e.g., changing tabs.
async function waitForWebUiUpdate(divToWatch) {
	const promise = new Promise((resolve, reject) => {
		// Options for the observer (which mutations to observe)
		const mutationConfig = { attributes: true, childList: true, subtree: true };
		// Callback for when mutation happened. Will simply invoke the passed `onDivUpdated` and
		// stop observing.
		const onMutationHappened = (mutationList, observer) => {
			observer.disconnect();
			resolve();
		}
		const observer = new MutationObserver(onMutationHappened);
		observer.observe(divToWatch, mutationConfig);
	});

	return await promise;
}
