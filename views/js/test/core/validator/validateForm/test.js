define( [  "lodash", "jquery", "ui/validator" ], function(  _, $ ) {
    "use strict";

    QUnit.test( "create, destroy", function( assert ) {

        $( "#text1" ).validator();
        assert.ok( $( "#text1" ).validator( "getValidator" ), "validator bound" );
        assert.ok( $( "#text1" ).data( "validator-instance" ), "validator bound" );
        assert.ok( $( "#text1" ).data( "validator-config" ), "validator bound" );

        $( "#text1" ).validator( "destroy" );
        assert.ok( !$( "#text1" ).data( "validator-instance" ), "validator bound" );
        assert.ok( !$( "#text1" ).data( "validator-config" ), "validator bound" );
    } );

    QUnit.test( "validate empty validator", function( assert ) {

        assert.expect( 1 );
        $( "#text0" ).validator( "validate", function( valid, res ) {
            assert.ok( valid, "valid empty validator" );
        } );
    } );

    QUnit.test( "validate element", function( assert ) {
        var ready = assert.async(3);
        //Set test value;
        $( "#text1" ).validator();
        assert.ok( $( "#text1" ).validator( "getValidator" ), "validator bound" );

        
        $( "#text1" ).val( "York" );
        $( "#text1" ).validator( "validate", {}, function( valid, res ) {
            ready();

            assert.ok( valid, "the element is valid" );
            assert.equal( _.size( res ), 2, "validated" );

            var report1 = res.shift();
            assert.equal( report1.type, "success" );
            assert.equal( report1.data.validator, "notEmpty" );

            var report2 = res.shift();
            assert.equal( report2.type, "success" );
            assert.equal( report2.data.validator, "pattern" );
        } );

        
        $( "#text1" ).val( "" );
        $( "#text1" ).validator( "validate", {}, function( valid, res ) {
            ready();

            assert.ok( valid === false, "the element isn't valid" );
            assert.equal( _.size( res ), 2, "validated" );

            var report1 = res.shift();
            assert.equal( report1.type, "failure" );
            assert.equal( report1.data.validator, "notEmpty" );

            var report2 = res.shift();
            assert.equal( report2.type, "failure" );
            assert.equal( report2.data.validator, "pattern" );
        } );

        
        $( "#text1" ).val( "Yor" );
        $( "#text1" ).validator( "validate", {}, function( valid, res ) {
            ready();

            assert.ok( valid === false, "the element isn't valid" );
            assert.equal( _.size( res ), 2, "validated" );

            var report1 = res.shift();
            assert.equal( report1.type, "success" );
            assert.equal( report1.data.validator, "notEmpty" );

            var report2 = res.shift();
            assert.equal( report2.type, "failure" );
            assert.equal( report2.data.validator, "pattern" );
        } );

        //Reset test value:
        $( "#text1" ).val( "" );
        $( "#text1" ).validator( "destroy" );
    } );

    QUnit.test( "element event", function( assert ) {
        var ready = assert.async();
        
        $( "#text1" ).on( "validated", function( e, data ) {
            ready();
            assert.equal( e.type, "validated", "event type ok" );
            assert.equal( data.elt, this, "validated element ok" );
            assert.equal( _.size( data.results ), 2, "results ok" );
        } );
        $( "#text1" ).validator( "validate" );

        $( "#text1" ).validator( "destroy" ).off( "validated" );
    } );

    QUnit.test( "form event", function( assert ) {
        var ready = assert.async();
        
        $( "#form1" ).on( "validated", function( e, data ) {
            ready();
            assert.equal( e.type, "validated", "event type ok" );
            assert.equal( data.elt, $( "#text1" )[ 0 ], "validated element ok" );
            assert.equal( _.size( data.results ), 2, "results ok" );
        } );
        $( "#text1" ).validator( "validate" );

        $( "#text1" ).validator( "destroy" );
        $( "#form1" ).off( "validated" );
    } );

    QUnit.test( "callback and event binding", function( assert ) {

        assert.expect( 5 );

        //Set validators and options in data attributes:
        $( "#text2" ).data( "validate", "$notEmpty; $pattern(pattern=[A-Z][a-z]{5,})" );
        $( "#text2" ).data( "validate-option", "$lazy; $event(type=keyup, length=3);" );

        //Set default callback, and test to results
        $( "#text2" ).validator( {
            validated:function( valid, results ) {
                assert.equal( this, $( "#text2" )[ 0 ], "validated element ok" );
                assert.equal( _.size( results ), 2, "results ok" );
            }
        } );

        //Set additonal event "validated" listener and test to results
        $( "#text2" ).on( "validated", function( e, data ) {
            assert.equal( e.type, "validated", "event type ok" );
            assert.equal( data.elt, $( "#text2" )[ 0 ], "validated element ok" );
            assert.equal( _.size( data.results ), 2, "results ok" );
        } );

        //Set text and validation according to event "keyup" option, then trigger it:
        $( "#text2" ).val( "Abcdef" ).keyup();
    } );

} );
