/**
 * boxlayout.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
var Boxlayout = (function() {

	var $el = $( '#bl-main' ),
		$sections = $el.children( 'section' ),
		// works section
		$sectionWork = $( '.bl-work-section' ),
		// work items
		$workItems = $( '.bl-work-items > li.item' ),
		$vizItems = $( '.bl-viz-items > li.item' ),
		$caseItems = $( '.bl-case-items > li.item' ),
		// work panels
		$workPanelsContainer = $( '#bl-panel-work-items,#bl-panel-case-items' ),
		$vizPanelsContainer = $( '#bl-panel-work-items'),
		$casePanelsContainer = $( '#bl-panel-case-items'),
		$workPanels = $workPanelsContainer.children( 'div' ),
		$vizPanels = $vizPanelsContainer.children( 'div' ),
		totalWorkPanels = $workPanels.length,
		totalVizPanels = $vizPanels.length,
		// navigating the work panels
		$nextWorkItem = $workPanelsContainer.find( 'nav > span.bl-next-work' ),
		// if currently navigating the work items
		isAnimating = false,
		// close work panel trigger
		$closeWorkItem = $workPanelsContainer.find( 'nav > div.bl-icon-close' ),
		// $closeWorkItemCase = $workPanelsContainer.find( 'nav > div.bl-icon-close-case' ),
		transEndEventNames = {
			'WebkitTransition' : 'webkitTransitionEnd',
			'MozTransition' : 'transitionend',
			'OTransition' : 'oTransitionEnd',
			'msTransition' : 'MSTransitionEnd',
			'transition' : 'transitionend'
		},
		// transition end event name
		transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
		// support css transitions
		supportTransitions = Modernizr.csstransitions;

		console.log("work panels count " + totalWorkPanels);
		console.log("viz panels count " + totalVizPanels);
		console.log("close work item " + $closeWorkItem);


	function init() {
		initEvents();
	}

	function initEvents() {
		
		$sections.each( function() {
			
			var $section = $( this );

			// expand the clicked section and scale down the others
			$section.on( 'click', function() {

				if( !$section.data( 'open' ) ) {
					$section.data( 'open', true ).addClass( 'bl-expand bl-expand-top' );
					$el.addClass( 'bl-expand-item' );	
				}

			} ).find( 'div.bl-icon-close' ).on( 'click', function() {
				
				// close the expanded section and scale up the others
				$section.data( 'open', false ).removeClass( 'bl-expand' ).on( transEndEventName, function( event ) {
					if( !$( event.target ).is( 'section' ) ) return false;
					$( this ).off( transEndEventName ).removeClass( 'bl-expand-top' );
				} );

				if( !supportTransitions ) {
					$section.removeClass( 'bl-expand-top' );
				}

				$el.removeClass( 'bl-expand-item' );
				
				return false;

			} );

		} );

		// clicking on a work item: the current section scales down and the respective work panel slides up
		// NM separated into vizItems and case items for different behavior between the two sections
		$vizItems.on( 'click', function( event ) {

			// scale down main section
			$sectionWork.addClass( 'bl-scale-down' );

			// show panel for this work item
			$vizPanelsContainer.addClass( 'bl-panel-items-show' );

			var $panel = $vizPanelsContainer.find("[data-panel='" + $( this ).data( 'panel' ) + "']");
			currentWorkPanel = $panel.index();
			$panel.addClass( 'bl-show-work' );

			return false;

		} );

		$caseItems.on( 'click', function( event ) {

			// scale down main section
			$sectionWork.addClass( 'bl-scale-down' );

			// show panel for this work item
			$casePanelsContainer.addClass( 'bl-panel-items-show' );

			var $panel = $casePanelsContainer.find("[data-panel='" + $( this ).data( 'panel' ) + "']");
			currentWorkPanel = $panel.index();
			$panel.addClass( 'bl-show-work' );

			$closeCaseItem.addClass('close-case');

			return false;

		} );

		// navigating the work items: current work panel scales down and the next work panel slides up
		$nextWorkItem.on( 'click', function( event ) {
			
			if( isAnimating ) {
				return false;
			}
			isAnimating = true;

			var $currentPanel = $workPanels.eq( currentWorkPanel );
			currentWorkPanel = currentWorkPanel < totalWorkPanels - 1 ? currentWorkPanel + 1 : 0;
			var $nextPanel = $workPanels.eq( currentWorkPanel );

			$currentPanel.removeClass( 'bl-show-work' ).addClass( 'bl-hide-current-work' ).on( transEndEventName, function( event ) {
				if( !$( event.target ).is( 'div' ) ) return false;
				$( this ).off( transEndEventName ).removeClass( 'bl-hide-current-work' );
				isAnimating = false;
			} );

			if( !supportTransitions ) {
				$currentPanel.removeClass( 'bl-hide-current-work' );
				isAnimating = false;
			}
			
			$nextPanel.addClass( 'bl-show-work' );

			return false;

		} );

		// clicking the work panels close button: the current work panel slides down and the section scales up again
		$closeWorkItem.on( 'click', function( event ) {

			// scale up main section
			$sectionWork.removeClass( 'bl-scale-down' );
			$workPanelsContainer.removeClass( 'bl-panel-items-show' );
			currentCasePanel = totalVizPanels + currentWorkPanel;
			$workPanels.eq( currentWorkPanel ).removeClass( 'bl-show-work' );
			$workPanels.eq( currentCasePanel ).removeClass( 'bl-show-work' );

			$closeCaseItem.removeClass('close-case');
			
			console.log("total viz panels " + totalVizPanels);
			console.log("current work panel " + currentWorkPanel);
			console.log("current case panel " + currentCasePanel);

			return false;


		} );

		//Repeating work panel close button for case study items
		// $closeWorkItemCase.on( 'click', function( event ) {

		// 	// scale up main section
		// 	$sectionWork.removeClass( 'bl-scale-down' );
		// 	$workPanelsContainer.removeClass( 'bl-panel-items-show' );
		// 	currentCasePanel = totalVizPanels + currentWorkPanel;
		// 	$workPanels.eq( currentCasePanel ).removeClass( 'bl-show-work' );
			
		// 	console.log("total viz panels " + totalVizPanels);
		// 	console.log("current work panel " + currentWorkPanel);
		// 	console.log("current case panel " + currentCasePanel);

		// 	return false;
		// } );


	}

	return { init : init };

})();