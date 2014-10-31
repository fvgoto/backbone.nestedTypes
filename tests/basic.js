define( function( require, exports, module ){
    describe( 'Basic functionality', function(){
        describe( 'Model.defauls', function(){
            it( 'can be substituted with "Model.attributes"' );
            it( 'create native properties for every entry' );
            it( 'inherit entries from the base model' );
            it( 'deep copy JSON literals' );
        });

        describe( 'Inline Collection definition', function(){
            it( 'create Collection type for every model' );
            it( 'inherit collection from the base model' );
            it( 'takes Collection definition from Model.collection' );
        });

        describe( 'Class type', function(){
            it( 'can be extended' );
            it( 'can throw/listen to events' );
        });

        describe( 'Explicit native properties spec', function(){
            it( 'can define read-only property' );
            it( 'can define read-write property' );
            it( 'is supported in Class, Model, and Collection' );
            it( 'override native properties for model\'s attributes' );
            it( 'may turn off native properties for model\'s attributes' );
        });

        describe( 'Run-time errors', function(){
            it( 'Property "name" conflicts with base class members' );
            it( 'Attribute hash is not an object' );
            it( 'Attribute "name" has no default value' );
            it( '"defaults" must be an object, functions are not supported' );
        });
    });
});