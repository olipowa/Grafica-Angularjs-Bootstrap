/**
 * Created by oiglesia on 26/06/2015.
 */
/**
 * Angulajs bloq main declarations
 */
/**
 * Declaracion del objeto angular.
 */
angular
    .module('panelApp',['ngSanitize','chart.js'])//Declaración modelo de datos de angular.
    .directive('ngEnter', function() {// Creacion de la directiva ng-Enter para implementarlo en las funciones.
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter);
                    });
                    event.preventDefault();
                }
            });
        };
    })
    .controller('panelAppCtrl',['$scope','$http','$interval',mainController]);//Declaracion del controlador principal de angular

/**
 * funcion de controlador principal de angular js que portara las sub.funciones que daran funcionalidad a la app web
 * @param $scope
 * @param $http
 * @param $interval
 */
function mainController($scope,$http,$interval) {
    //Bloque declaraciones variables principales de la app
    /**
     * contendra el string de la url completa del servidor al que se vaya a conectar
     * @type {string}
     */
    $scope.url = "";
    /**
     * contendra el string de la url del servidor al que se vaya a conectar
     * @type {string}
     */
    $scope.urlServer = "http://h2228012.stratoserver.net";
    /**
     * contendra el string de los puertos del servidor al que se vaya a conectar
     * @type {string}
     */
    $scope.portServer = "8080";
    /**
     * Contendra la cabecera que se usara en funciones posteriores que realizaran peticiones alm servidor
     * @type {{headers: {Content-Type: string}}}
     */
    $scope.headers = {headers: {'Content-Type': 'application/x-www-form-urlencoded'}};
    $scope.datasServer = "";
    $scope.cantOk = false;
    $scope.error = false;
    $scope.nameModels = [];
    $scope.panelCols = false;
    $scope.optsNames = [
        'Ratio de Entradas',
        'Ventas mensuales',
        'Importe medio x tiquet',
        'Venta media x vendedor',
        'Ratio de uso de tarjetas',
        'Importe x Tarjetas',
        'Otros'
    ];
    $scope.groupType = "";

    //Bloque funciones
    $scope.login = function () {
        //Function que llamara al servidor para realizar el login.
        $http.post($scope.url,
            "cmd=users.login&CCA=999999999&user=Admin&password=ims&lng=10&format=2",
            $scope.headers
        ).success(function (response) {
                $scope.sessionICU = response.nna.data.sessionICU;
                $scope.RequestData();
                $interval(function () {
                    $scope.RequestData();
                }, 10000);
            }).error(function () {
                alert("Error en la petición de datos");
            })
    }
    $scope.RequestData = function () {
        //alert("entra en el intervalo");
        $http.post($scope.url,
            "cmd=data.getDataRows&NN=9009&" + $scope.geneParams() + "sessionICU=" + $scope.sessionICU + "&lng=10&format=2",
            $scope.headers
        ).success(function (response) {
                $scope.datasServer = response.nna.data.rows;
            }).error(function () {
                alert("Error en la petición de datos");
            })
    }
    $scope.generatedNamesModels = function () {
        for (var i = 1; i <= $scope.cantCols; i++) {
            $scope.nameModels.push({
                "filedName": "field" + (i),
                "datasOptions": $scope.nameOptions(),
                "groupType" : $scope.randomTypeGroup(),
                "typeDara" : $scope.randomTypeDatas(),
                "optSelected": {"namOpt": $scope.optsNames[i], "valOpt": (i)}
            });
        }
    }
    $scope.nameOptions = function () {
        var opts = "[";
        for (var i = 0; i < $scope.optsNames.length; i++) {
            opts += '{"namOpt" : "' + $scope.optsNames[i] + '","valOpt" :  ' + (i + 1) + '}';
            if (i+1 < $scope.optsNames.length)opts += ',';
        }
        opts += "]";
        return JSON.parse(opts);
    }
    $scope.valuesGrafics = function() {
        $scope.dataGraphics = [[[],[],[]],[[],[],[]],[[],[],[]]];
        for(var i =0;i<$scope.datasServer[0].cells.length;i++){
            for(var j = 0;j <$scope.datasServer.length;j++){
                $scope.dataGraphics[i][j].push($scope.datasServer[j].cells[i].id);
            }
        }
    }
    /*$scope.loadGrafics = function(){
     for(var i=0;i<$scope.datasServer[0].cells.length;i++){
     $scope.grafics[i] = "<canvas class='chart chart-bar' data='dataGraphics["+i+"]' labels='labels'></canvas>";
     }
     }*/
    $scope.geneParams = function () {
        var params = "";
        for (var i = 0; i < $scope.cantCols; i++) {
            params += $scope.nameModels[i].filedName + "=" + $scope.nameModels[i].optSelected.valOpt + "&";
        }
        return params;
    }
    $scope.randomTypeGroup =  function(){
        var opt = Math.floor((Math.random() * 3) + 1);
        switch(opt){
            case 1:{
                $scope.groupType = "CLIENTES";
                return "CLIENTES";
            }
            case 2:{
                $scope.groupType = "VENTAS";
                return "VENTAS";
            }
            case 3:{
                $scope.groupType = "FIDELIZACIÓN";
                return "FIDELIZACIÓN";
            }
        }
    }
    $scope.randomTypeDatas =  function(typeGroup){

        if($scope.groupType==="CLIENTES"){
            return "Ratio de Entradas";
        }
        else if($scope.groupType==="VENTAS"){
            var opt = Math.floor((Math.random() * 3) + 1);
            switch(opt){
                case 1:{
                    return "Ventas mensuales";
                }
                case 2:{
                    return "Importe medio x tiquet";
                }
                case 3:{
                    return "Venta media x vendedor";
                }
            }
        }
        else if($scope.groupType==="FIDELIZACIÓN"){
            var opt = Math.floor((Math.random() * 2) + 1);
            switch(opt){
                case 1:{
                    return "Ratio de uso de tarjetas";
                }
                case 2:{
                    return "Impore por Tarjetas";
                }
            }
        }
    }
    $scope.changesHeadsCols = function(nombreOpt,index){
        if(nombreOpt == "Ventas mensuales" || nombreOpt == "Importe medio x tiquet" || nombreOpt == "Venta media x vendedor"){
            $scope.nameModels[index].groupType="VENTAS";
        }
        else if(nombreOpt == "Ratio de uso de tarjetas" || nombreOpt == "Importe x Tarjetas"){
            $scope.nameModels[index].groupType="FIDELIZACIÓN";
        }
        else if(nombreOpt == "Ratio de Entradas"){
            $scope.nameModels[index].groupType="CLIENTES";
        }
        else{
            $scope.nameModels[index].groupType="OTROS ASPECTOS";
        }
        $scope.RequestData();
    }
}

