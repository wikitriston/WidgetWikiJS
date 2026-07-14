/*!
* EditTools support
*
* Add a selector, change into true buttons, enable for all text input fields
* If enabled in preferences, the script puts the buttons into the WikiEditor Toolbar
* The special characters to insert are defined at [[MediaWiki:Edittools]].
*/
// <nowiki>
/* global jQuery, mediaWiki */
/* eslint indent:["error","tab",{"outerIIFEBody":0}] */
( function ( $, mw ) {
'use strict';

var oldEdittools,
	$currentFocused,
	$spec,
	$sb,
	$toolbar,
	EditTools = window.EditTools = {

		insertTags: function ( start, peri, end ) {
			if ( $currentFocused.length ) {
				$currentFocused.textSelection(
					'encapsulateSelection', {
						pre: start,
						peri: peri,
						post: end
					}
				);
			}
		},

		createSelector: function () {
			var $sel;
			// Only care if there is more than one
			if ( $sb.length <= 1 ) { return; }

			$sel = $( '<select>' ).on( 'change', this.chooseCharSubset );

			$sb.each( function ( i ) {
				var id = $( this ).attr( 'id' ).replace( /.([0-9A-F][0-9A-F])/g, '%$1' ).replace( /_/g, ' ' );
				$sel.append(
					$( '<option value="' + i + '">' ).text( decodeURIComponent( id ) )
				);
			} );

			$spec.prepend( $sel );
			this.chooseCharSubset();
			// Move old edittools just below
			$( '#editpage-copywarn' ).parent().before( $spec.parent() );
		},

		chooseCharSubset: function () {
			var id = $spec.find( 'select' ).val(),
				$wanted = $sb.eq( id );

			$sb.hide();
			EditTools.makeButtons( $wanted );
			$wanted.css( 'display', 'inline' );
		},

		bindOnClick: function ( $button, self ) {
		// Copy event
			var onclick = self.getAttribute( 'onclick' ), // TODO: outdated? For FF, IE8, Chrome
				$self = $( self ),
				start = $self.data( 'mw-charinsert-start' ),
				end = $self.data( 'mw-charinsert-end' );

			if ( !$.isFunction( onclick ) ) {
				if ( start || end ) {
				// Create new event
					onclick = function ( e ) {
						e.preventDefault();
						EditTools.insertTags( start, '', end );
					};
					// Shorten button text
					if ( start && end ) { $button.text( $self.text().replace( end, '' ) ); }
				} else if ( !onclick && $.isFunction( $._data ) ) {
				// Fallback hack for backward compatibility
					onclick = $._data( self, 'events' ).click;
					if ( $.isArray( onclick ) && onclick.length ) {
						onclick = onclick[ 0 ].handler;
					}
				}
			}
			$button.on( 'click', onclick );
		},

		makeButtons: function ( $wanted ) {
			var $links = $wanted.find( 'a' ),
				self = this;

			$links.each( function () {
				var $button = $( '<button type="button">' )
					.text( $( this ).text() );

				self.bindOnClick( $button, this );

				$( this ).replaceWith( $button ).blur();
			} );
			$wanted.contents().not( 'button' ).remove();
		},

		makeToolbarButtons: function () {
			EditTools.done = 1;
			var section = [],
				self = this;

			// Add Edittool section
			$toolbar.wikiEditor( 'addToToolbar', {
				sections: {
					Edittools: {
						type: 'booklet',
						label: 'Edittools',
						pages: {
							Edittools1: {
								layout: 'characters',
								label: 'Edittools2'
							}
						}
					}
				}
			} );

			$sb.eq( 0 ).find( 'a' )
				.each( function () {
					var $button = $( '<span>' )
						.text( $( this ).text() );
					self.bindOnClick( $button, this );
					section.push( $button );
				} );
			$( '.page-Edittools1 div' )
				.append( section )
				.addClass( 'com-editbuttons' );

			// Must start after toolbar creation
			this.createSelector();
			// $( '.mw-editTools' ).remove(); // The full remove is not implicit and there is more as only the standard buttons
		},

		enableForAllFields: function () {
			$currentFocused = $toolbar;
			// Apply to dynamically created textboxes as well as normal ones
			$( document ).on( 'focus', 'textarea, input:text, .CodeMirror', function () {
				// CodeMirror hooks into #wpTextbox1 for textSelection changes
				$currentFocused = $( this );
				if ( $currentFocused.hasClass( 'CodeMirror' ) ) { $currentFocused = $( '#wpTextbox1' ); }
			} );
		},

		// As elements from ext.wikiEditor are not immediately ready on load.
		handleToolbarQueue: function () {
			// FIXME: the current sync load is a bit hackish (double try) [[phab:T30563]]
			// Try early as possible to put the event
			$toolbar.on( 'wikiEditor-toolbar-doneInitialSections', function () {
				if ( !EditTools.done ) { EditTools.makeToolbarButtons(); }
			} );
			// Try again if we missed the event.
			mw.loader.using( 'ext.wikiEditor', function () {
				if ( !EditTools.done ) { EditTools.makeToolbarButtons(); }
			} );
		},

		setup: function () {
			mw.loader.load( '//commons.wikimedia.org/?title=MediaWiki:Edittools.css&action=raw&ctype=text/css', 'text/css' );
			$sb = $spec.find( 'p.specialbasic' );
			// Decide whether to use the toolbar
			if ( $toolbar && $toolbar[ 0 ] && !( window.oldEdittools || oldEdittools ) && !$( '#wpUploadDescription' ).length ) {
				this.handleToolbarQueue();
			} else {
				this.createSelector();
			}
			mw.hook( 'wikipage.content' ).add( this.enableForAllFields );
		}
	};
$( function () {
	$spec = $( '#specialchars' );
	// Don't do anything if no edittools present.
	if ( !$spec.length ) { return; }
	mw.loader.using( 'user.options', function () {
		// Check user preferences
		oldEdittools = mw.user.options.get( 'gadget-OldEdittools' );
		if ( ( mw.user.options.get( 'usebetatoolbar' ) || mw.loader.getState( 'ext.wikiEditor' ) !== 'registered' ) && !oldEdittools ) {
			$toolbar = $( '#wpTextbox1' );
			EditTools.setup();
		}
	} );
} );
}( jQuery, mediaWiki ) );
// </nowiki>
