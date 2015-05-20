Nested.options = ( function(){
    var Options = Object.extend({
        _options : {},

        constructor : function( obj ){
            this._options = {};

            Object.xmap( this, obj, function( v, name ){
                if( !this[ name ] ){
                    return function( value ){ this._options[ name ] = value };
                }
            });
        },

        get : function( getter ){
            var options = this._options;
            options.get = options.get ? options.get.push( getter ) : [ getter ];
        },

        set : function( setter ){
            var options = this._options;
            options.set = options.set ? options.set.push( setter ) : [ setter ];
        },

        events : function( events ){
            this._options.events = Object.assign( this._options.events || {}, events );
        },

        options : function( options ){
            for( var i in options ){
                this[ i ]( options[ i ]);
            }
        },

        createAttribute : function( name ){
            var options = this._options,
                Type = options.type ? options.type.NestedType : Attribute;

            return new Type( name, options );
        }
    });

    function chainHooks( array ){
        var l = array.length;

        return l === 1 ? array[ 0 ] : function( value, name ){
            var res = value;
            for( var i = 0; i < l; i++ ) res = array[ i ].call( this, res, name );

            return res;
        };
    }

    var Attribute = Object.extend({
        type : null,
        value : undefined,

        create : function(){ return new this.type(); },

        clone : function( value, options ){
            if( value && typeof value === 'object' ){
                var proto = Object.getPrototypeOf( value );

                if( proto === Object.prototype || proto === Array.prototype ){
                    return JSON.parse( JSON.stringify( value ) );
                }
                else if( value.clone ){
                    return value.clone( options );
                }
            }

            return value;
        },

        property : function( name ){
            var spec = {
                    set : function( value ){
                        this.set( name, value );
                        return value;
                    },

                    enumerable : false
                },
                get = this.get;

            spec.get = get ? function(){
                return get.call( this, this.attributes[ name ], name );
            } : function(){
                return this.attributes[ name ];
            };

            return spec;
        },

        intermediate : null,

        transform : function( value ){ return value; },

        trCastAnsHook : function( val, options, model ){
            var name = this.name,
                value = this.cast( val, options, model ),
                prev = model.attributes[ name ];

            if( value === prev ) return prev;

            value = this.set.call( model, value, name );
            return value === undefined ? prev : this.cast( value, options, model );
        },

        trHook : function( value, options, model ){
            var name = this.name;
            var prev = model.attributes[ name ];
            return value === prev ? prev : this.set.call( model, value, name );
        },

        trHookAndDelegate : function ( val, options, model, attr ){
            return this.delegateEvents( this.hookedCast( val, options, model ), options, model, attr );
        },

        trDelegate : function( value, options, model, attr ){
            var prev = model.attributes[ attr ];

            if( prev !== value ){
                prev && model.stopListening( prev );
                value && model.listenTo( value, this.events );
                model.trigger( 'replace:' + attr, model, prev, value );
            }

            return value;
        },

        initialize : function( name, spec ){
            this.name = name;

            Object.xmap( this, spec, function( value, name ){
                if( name === 'events' && this.events ){
                    return Object.assign( this.events, value );
                }

                if( name === 'get' ){
                    if( this.get ) value.unshift( this.get );
                    return chainHooks( value );
                }

                if( name === 'set' ){
                    if( this.set ) value.push( this.set );
                    return chainHooks( value );
                }

                return value;
            }, this );

            // assemble optimized transform function...
            if( this.cast )   this.transform = this.intermediate = this.cast;
            if( this.set )    this.transform = this.intermediate = this.cast ? this.trCastAnsHook : this.trHook;
            if( this.events ) this.transform = this.intermediate ? this.trDelegate : this.trHookAndDelegate;
        }
    },{
        bind : ( function(){
            var attributeMethods = {
                options : function( spec ){
                    spec.type || ( spec.type = this );
                    return new this.NestedType( spec );
                },

                value : function( value ){
                    return new this.NestedType({ type : this, value : value });
                }
            };

            return function(){
                _.each( arguments, function( Type ){
                    _.extend( Type, attributeMethods, { NestedType : this } );
                }, this );
            };
        })()
    });

    Attribute.extend({
        cast : function( value ){
            return value == null || value instanceof this.type ? value : new this.type( value );
        },
        clone : function( value ){
            return this.cast( JSON.parse( JSON.stringify( value ) ) );
        }
    }).bind( Function.prototype );

    var primitiveTypes = {
        string : String,
        number : Number,
        boolean : Boolean
    };

    function createOptions( spec ){
        if( arguments.length >= 2 ){
            spec = {
                type : arguments[ 0 ],
                value : arguments[ 1 ]
            };

            if( arguments.length >= 3 ){
                _.extend( spec, arguments[ 2 ] );
            }
        }
        else if( 'typeOrValue' in spec ){
            var typeOrValue = spec.typeOrValue,
                primitiveType = primitiveTypes[ typeof typeOrValue ];

            if( primitiveType ){
                spec = { type : primitiveType, value : typeOrValue };
            }
            else{
                spec = _.isFunction( typeOrValue ) ? { type : typeOrValue } : { value : typeOrValue };
            }
        }

        return spec.type ? spec.type.options( spec ) : new Options( spec );
    }

    createOptions.Type = Attribute;
    return createOptions;
})();