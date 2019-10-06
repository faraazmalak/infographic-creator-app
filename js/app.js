const vm = new Vue({
    el: "#infographic-app",
    data: {

        //Observable for uploaded images
        savedImages: [],

        //Observable for assets placed on the canvas
        assets: {},

        //Observable representing currently selected asset
        selectedAssets: {},

        testCases: {
            'case1': {
                label: 'Add 3 images to the assets observable and reload the page',
                details: 'vm.assets observable gets populated with  3 images. Once assets observable is populated, the 3 images are stored in localStorage. Upon browser reload, vm.assets observable would be populated with localStorage data and the three images would automatically show up on the canvas.',
                data: '{"canvas-image-uploads-146294845960":{"src":"http://localhost:8000/images/uploads-1462948459604.png","top":"295.79999923706055px","left":"128.9375px","width":"auto","height":"auto","id":"canvas-image-uploads-146294845960","resizeFrame":false,"assetControls":true,"type":"image"},"canvas-image-uploads-146294847058":{"src":"http://localhost:8000/images/uploads-1462948470584.png","top":"32.30000305175781px","left":"14.9375px","width":"auto","height":"auto","id":"canvas-image-uploads-146294847058","resizeFrame":false,"assetControls":true,"type":"image"},"canvas-image-uploads-146294849822":{"src":"http://localhost:8000/images/uploads-1462948498227.png","top":"48.80000305175781px","left":"315.9375px","width":"auto","height":"auto","id":"canvas-image-uploads-146294849822","resizeFrame":true,"assetControls":true,"type":"image"}}'
            },
            'case2': {
                label: 'Remove selected asset from the canvas',
                details:'The selected asset is removed from the localStorage as well. Upone page reload, the removed asset wont be present on the canvas'
            },
            'case3':{
                label: 'Add text box to the canvas',
                details: 'Text box should be added to the canvas. Upone page reload, the text box should be present on the canvas'
            }
        },
        testCaseDetails:''
    },

    methods: {

        /**
         *POST the images to the server
         * @param {object} e Event data object
         */
        uploadImage(e) {
            e.preventDefault();
            var data = new FormData();
            data.append('upload', document.getElementById('img-upload').files[0]);

            $.ajax({

                url: "http://localhost:8000/uploads/",
                type: "POST",
                data: data,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false

            }).done(function (data) {

                if (data.file) {
                    vm.savedImages.push(data.file);
                }
            });
            return false;
        },

        /**
         *Select the asset, when user clicks on it.
         * @param {object} e Event data object
         */
        selectAsset(e) {

            var assetID = e;

            if (typeof e == 'object') {
                e.stopPropagation();
                assetID = $(e.target).closest('.asset').attr('id');
            }

            if (!Boolean(vm.selectedAssets.editable)) {
                vm.selectedAssets && (vm.selectedAssets.resizeFrame = false);

                vm.selectedAssets = vm.assets[assetID];
                vm.selectedAssets.resizeFrame = true;
                vm.selectedAssets.assetControls = true;
            }


            return false;
        },

        /**
         *Deselect the asset
         *@param {object} e Event data Object
         */
        unselectAsset(e) {
            e.stopPropagation();

            if(!$.isEmptyObject(vm.selectedAssets)){
                vm.assets[vm.selectedAssets.id].resizeFrame = false
            }

            vm.selectedAssets = {};
            return false;
        },

        /**
         * Moves the asset on the canvas
         * @param {object} e Event data object
         */
        moveAsset(e) {


            e.stopPropagation();

            var assetObservable = vm.selectedAssets;

            switch (e.type) {
                case "mousedown": {

                    $('#artboard').on("mousemove.moveAsset mouseup.moveAsset mouseleave.moveAsset", vm.moveAsset);

                    break;
                }
                case "mousemove": {



                    var asset = $(e.target).closest('.movable');

                    vm.selectedAssets.top = e.pageY - ($('#artboard').offset().top + (asset.height() / 2)) + 'px';
                    vm.selectedAssets.left = e.pageX - ($('#artboard').offset().left + (asset.width() / 2)) + 'px';

                    break;


                }
                default: {
                    $('#artboard').off('.moveAsset');

                    break;
                }
            }
            return false;
        },

        /**
         *Resize the asset via the resize handles
         * @param {object} e Event data object
         */
        resizeAsset(e) {


            e.stopPropagation();


            var asset = $(e.target).closest('.asset').find('.canvas-image,.canvas-text');

            var assetObservable = vm.selectedAssets;
            var original_width = asset.width();
            var original_height = asset.height();
            var original_x = asset.offset().left;
            var original_y = asset.offset().top;
            var original_mouse_x = e.pageX;
            var original_mouse_y = e.pageY;
            var resizeHandle = $(e.target);


            $('#artboard').on('mousemove.resizeAsset', function (e) {
                e.stopPropagation();

                //Calculations to resize the asset, depending on the handle selected
                //Calculations to resize the asset, depending on the handle selected
                if (resizeHandle.hasClass('bottom-right')) {
                    assetObservable.width = original_width + (e.pageX - original_mouse_x) + 'px';
                    assetObservable.height = original_height + (e.pageY - original_mouse_y) + 'px';
                }
                else if (resizeHandle.hasClass('bottom-left')) {

                    assetObservable.width = original_width - (e.pageX - original_mouse_x) + 'px';
                    assetObservable.height = original_height + (e.pageY - original_mouse_y) + 'px'
                    assetObservable.left = e.pageX - ($('.canvas').offset().left) + 'px'
                }
                else if (resizeHandle.hasClass('top-right')) {

                    assetObservable.width = original_width + (e.pageX - original_mouse_x) + 'px'
                    assetObservable.height = original_height - (e.pageY - original_mouse_y) + 'px'
                    assetObservable.top = e.pageY - ($('.canvas').offset().top) + 'px';
                }
                else {

                    assetObservable.width = original_width - (e.pageX - original_mouse_x) + 'px'
                    assetObservable.height = original_height - (e.pageY - original_mouse_y) + 'px'
                    assetObservable.top = e.pageY - ($('.canvas').offset().top) + 'px';
                    assetObservable.left = e.pageX - ($('.canvas').offset().left) + 'px'
                }
            });

            $('#artboard').on('mouseup.resizeAsset mouseleave.resizeAsset', function () {
                e.stopPropagation();
                $('#artboard').off('.resizeAsset');
            });


            return false;
        },

        /**
         *Functions for drag and drop of assets
         */
        startAssetDrag(e) {

            vm.unselectAsset(e);


        },

        dragAsset(e) {
            $.isEmptyObject(vm.selectedAssets) && e.preventDefault();
        },

        dropAsset(e) {

            e.preventDefault();


            e.target.src = e.dataTransfer.getData("text");

            //Once the asset is dropped on the canvas, ass it to the vm.assets observable
            vm.addToCanvas(e);
        },

        /**
         * Do not allow the user to drag and drop one asset on top of another
         * @param {object} e Event Data Object
         */
        dropOnAsset(e){
            e.preventDefault();
            e.stopPropagation();

        },

        /**
         *Allow the user to edit the text, when Edit button is clicked
         * @param {object} e Event data object
         */
        editText(e) {
            e.stopPropagation();


            var observable = vm.assets[$(e.target).closest('.asset').attr('id')];

            observable.editable = true;
            observable.resizeFrame = false;

            var textBox = $(e.target).closest('.asset').find('.canvas-text');
            setTimeout(function () {
                textBox.focus();
                textBox.focusin();
            }, 100)


        },

        /**
         * Save the text to the observable, when Save button is clicked
         * @param {object} e Event Data object
         */
        saveText(e) {
            var asset = $(e.target).closest('.asset');
            var assetObservable = vm.assets[asset.attr('id')];
            assetObservable.editable = false;
            assetObservable.text = asset.find('.canvas-text').text();
            assetObservable.resizeFrame = true;
        },



        /**
         * Places assets (text / images) on the canvas.
         * @param {object} e Event data object
         */
        addToCanvas(e) {

            //Place asset directly on the canvas, when the asset is clicked and not dragged
            var topOffset = ($('#artboard').height() / 2) - ($(e.target).height()) + 'px';
            var leftOffset = ($('#artboard').width() / 2) - ($(e.target).width()) + 'px';


            var assetID;
            var imgUrl = e.target.src;

            if (imgUrl) {


                if (e.type == 'drop') {
                    //If image is dragged and placed, position the image relative to the cursor pointer

                    topOffset = (e.clientY - $('#artboard').offset().top) + 'px';
                    leftOffset = (e.clientX - $('#artboard').offset().left) + 'px';

                }

                //Creates the image asset with below properties and assigns it to vm.assets observable
                assetID = 'canvas-image-' + new Date().getTime();
                Vue.set(vm.assets, assetID, {
                    src: imgUrl,
                    top: topOffset,
                    left: leftOffset,
                    width: 'auto',
                    height: 'auto',
                    id: assetID,
                    resizeFrame: false,
                    assetControls: false,
                    type: 'image'
                });

            } else {

                //Creates the text asset with below properties and assigns it to vm.assets observable
                var assetID = "canvas-text-" + new Date().getTime();
                Vue.set(vm.assets, assetID, {
                    text: "Your text goes here",
                    editable: false,
                    resizeFrame: false,
                    assetControls: false,
                    top: topOffset,
                    left: leftOffset,
                    width: '200px',
                    height: '150px',
                    id: assetID,
                    type: 'text'
                });
            }
            vm.selectAsset(assetID)
        },

        /**
         * Removes the assets from the canvas.
         * Assets can be removed either by clicking the Remove button OR by pressing the DELETE key
         * @param {object} e Event data object
         */
        removeFromCanvas(e) {
            e.stopPropagation();
            Vue.delete(vm.assets, vm.selectedAssets.id);
            vm.selectedAssets = {};

        },

        loadTestCase(e){
            var caseID = e.target.value;

            switch (caseID){
                case "case1":{

                    vm.assets = JSON.parse(vm.testCases[caseID].data);
                    vm.testCaseDetails = vm.testCases[caseID].details;
                    break;
                }
                case "case2":{
                    vm.removeFromCanvas(e);
                    window.location.reload();
                    vm.testCaseDetails = vm.testCases[caseID].details;
                    break;
                }
                case "case3":{
                    $('#addText').click()
                    vm.testCaseDetails = vm.testCases[caseID].details;
                    break;
                }
                default:{
                    vm.testCaseDetails = "";
                }
            }

        }
    },

    watch: {
        assets: {
            handler: function () {

                //Watch for changes to the vm.assets observable.
                //Whenever there is a change, update the browser's localStorage
                //The vm.assets observable is converted to a JSON string and stored in localStorage
                localStorage['canvasAssets'] = JSON.stringify(vm.assets);
            },
            deep: true
        },
        selectedAssets:{
            handler: function(){
                localStorage['selectedAssets'] = JSON.stringify(vm.selectedAssets);
            },
            deep: true
        }
    },
    created: function () {


        fetch('http://localhost:8000/images/')
            .then(response => response.json())
            .then(function (json) {
                    /*Fetch all the images uploaded on the server.
                    vm.savedImages observable is populated with the images fetched,
                    which in turn updates the UI
                    */
                    vm.savedImages = json;
                }
            );

        //This event removes the asset from the canvas, when DELETE key is pressed
        $('body').on('keyup', function (e) {
            e.keyCode == 46 && vm.removeFromCanvas(e);
        });

        /*If there is any data stored in browser's localStorage,
          fetch the data and populate the vm.assets observable, which in turn updates the canvas
        */
        try{
            localStorage.hasOwnProperty('canvasAssets') && (this.assets = JSON.parse(localStorage['canvasAssets']));
            localStorage.hasOwnProperty('selectedAssets') && (this.selectedAssets = JSON.parse(localStorage['selectedAssets']));
        }catch(e){
            console.log(e)
        }


    }
});
