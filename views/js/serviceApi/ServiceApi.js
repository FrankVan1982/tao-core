define(['jquery'], function($){
    
    function ServiceApi(baseUrl, parameters, serviceCallId, stateStorage){
        this.baseUrl = baseUrl;
        this.parameters = parameters;
        this.connected = false;

        this.serviceCallId = serviceCallId; 
        this.state = stateStorage;

        this.onFinishCallback;
        this.onDisplayChangeCallback;
    }

    ServiceApi.prototype.loadInto = function(frame, loaded){
            var api = this;
            $(frame).load(function() {
                $(document).on('serviceready', function(){
                    api.connect(frame);
                    if(typeof loaded === 'function'){
                        loaded();
                    }
                });
            });
            $(frame).attr('src', this.getCallUrl());
    };

    ServiceApi.prototype.connect = function(frame){
        if(this.connected === false && frame.contentWindow){
            //frame.contentWindow.serviceApi = this;
            if (typeof(frame.contentWindow.onServiceApiReady) === "function") {
                frame.contentWindow.onServiceApiReady(this);
                this.connected = true;
            }
        }
    };

    ServiceApi.prototype.getCallUrl = function(){
        var callUrl = this.baseUrl + '?';
        $.each(this.parameters,function (name, value) {
                callUrl += encodeURIComponent(name) + "=" + encodeURIComponent(value) + "&";
        });
        callUrl += 'serviceCallId=' + encodeURIComponent(this.serviceCallId);
        return callUrl;
    };

    //Context
    ServiceApi.prototype.getServiceCallId = function(){
        return this.serviceCallId;
    };

    //Context
    ServiceApi.prototype.getState = function(){
        return this.state.get();
    };

    ServiceApi.prototype.setState = function(state, callback){
        return this.state.set(state, callback);
    };

    // Variables 
    ServiceApi.prototype.getParameter = function(identifier){
        if (typeof(this.parameters[identifier]) !== "undefined") {
            return this.parameters[identifier];
        } else {
            return null;
        }
    };

    ServiceApi.prototype.onFinish = function(callback) {
        this.onFinishCallback = callback;	
    };

    // Flow
    // valueArray are return parameters of the service.
    ServiceApi.prototype.finish = function(valueArray) {
            //return execution to service caller
            if (typeof this.onFinishCallback === 'function') {
                    this.onFinishCallback(valueArray);
            }
    };

    return ServiceApi;

});