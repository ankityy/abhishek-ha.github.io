(function(factory){
	if(typeof module === 'object' && typeof module.exports === 'object') {
		factory(require('jquery'), window, document);
	} else {
		factory(jQuery, window, document);
	}
}(function($, window, document, undefined){
	/**
	 * AmsifySelect properties
	 * @param object
	 */
	AmsifySelect = function(selector) {
		this.selector = selector;
		this.method   = '';
		this.settings = {
			type : 'bootstrap',
			searchable : false,
			limit: 30,
			labelLimit: 5,
			classes: {
				clear : '',
				close : ''
			},
			consoleValue: false
		};
		this.name          	= null;
		this.id     		= null;
		this.defaultLabel  	= 'Select';
		this.classes       	= {
		    selectArea    : '.amsify-selection-area',
		    labelArea     : '.amsify-selection-label',
		    labelDefault  : '.amsify-selection-label-default',
		    labelMaterial : '.amsify-selection-label-material',
		    label         : '.amsify-label',
		    toggle        : '.amsify-toggle-selection',
		    listArea      : '.amsify-selection-list',
		    searchArea    : '.amsify-select-search-area',
		    search        : '.amsify-selection-search',
		    list          : '.amsify-list',
		    listGroup     : '.amsify-list-group',
		    listItem      : '.amsify-list-item',
		    itemPad       : '.amsify-item-pad',
		    noResult      : '.amsify-item-noresult',
		    inputType     : '.amsify-select-input',
		    operations    : '.amsify-select-operations',
		    clear         : '.amsify-select-clear',
		    close         : '.amsify-select-close',
		};
		this.defaultClass = {
		    bootstrap : {
		       clear : 'btn btn-default',
		        close : 'btn btn-default',
		    },
		    materialize : {
		        clear : 'btn waves-effect waves-light',
		        close : 'btn waves-effect waves-light',
		    },
		    amsify : {
		         clear : '',
		         close : '',
		    }
		};
		this.selectors = {
		    selectArea  : null,
		    labelArea   : null,
		    label       : null,
		    toggle      : null,
		    listArea    : null,
		    searchArea  : null,
		    search      : null,
		    list        : null,
		    operations  : null,
		    clear       : null,
		    close       : null,
		};
		this.options       = [];
		this.selected      = [];
		this.isMultiple    = false;
		this.isOptGroup    = false;
		this.isSearchable  = false;
		this.isHideButtons = null;
		this.clearClass    = null;
		this.closeClass    = null;
	};

	AmsifySelect.prototype = {

		_settings : function(settings) {
           this.settings = $.extend(this.settings, settings);      
       	},

      	_setMethod : function(method) {
        	this.method = method;
      	},

		/**
         * Executing all the required settings
         * @param  {selector} form
         */
        _init : function() {
            if(this.checkMethod()) {
				this.name         = $(this.selector).attr('name')? $(this.selector).attr('name')+'_amsify': 'amsify_selection';
				this.id           = ($(this.selector).attr('id') !== undefined) ? $(this.selector).attr('id')+'_amsify_selection_area': null;
				this.isSearchable = ($(this.selector).attr('searchable') !== undefined)? true: this.settings.searchable;
				this.isHideButtons = (this.settings.hideButtons === true)
				this.clearClass   = (this.settings.classes.clear)? this.settings.classes.clear: this.defaultClass[this.settings.type].clear;
				this.closeClass   = (this.settings.classes.close)? this.settings.classes.close: this.defaultClass[this.settings.type].close;
				this.extractData();
				this.createHTML();
				this.setEvents();
				$(this.selector).hide();
            }
        },

        extractData : function() {
          	var _self = this;

          	this.isMultiple = !!$(this.selector).prop('multiple');
          	this.isOptGroup = !!$(this.selector).find('optgroup').length;
			this.options = [];

          	if(this.isOptGroup) {
            	$firstItem = $(this.selector).find('option:first');

            	if($firstItem.length) {
	              	_self.options.push({
	                                    type  : 'option',
	                                    label : $firstItem.text(),
	                                });
            	}

            	for (let optgroup of Array.from(this.selector.childNodes.values()).filter(e => e.tagName === 'OPTGROUP')) {
					_self.options.push({
										type  : 'optgroup',
										label : $(optgroup).attr('label'),
									});

					for (let opt of optgroup.childNodes) {
						_self.addOption(opt)
					}
				}
          	} else {
				for (let opt of this.selector.childNodes) {
					_self.addOption(opt);
				}
          	}
        },

		addOption: function(option) {
			const data = {
						type      : 'option',
						value     : $(option).val(),
						label     : $(option).text(),
						selected  : ($(option).attr('selected') !== undefined)? 1 : 0
			           };

			this.options.push(data);
		},

        createHTML : function() {
			var HTML                  = '<div '+this.getSelectionAreaId()+' class="'+this.classes.selectArea.substring(1)+'"></div>';
			this.selectors.selectArea = $(HTML).insertAfter(this.selector);
			var labelHTML             = '<div class="'+this.classes.labelArea.substring(1)+'"></div>';
			this.selectors.labelArea  = $(labelHTML).appendTo(this.selectors.selectArea);

			this.defaultLabel         = (this.options[0].value)? this.defaultLabel: this.options[0].label;
			var label                 = '<div class="'+this.classes.label.substring(1)+'">'+this.defaultLabel+'</div>';
			this.selectors.label      = $(label).appendTo(this.selectors.labelArea);
			this.selectors.toggle     = $(this.toggleIcon()).appendTo(this.selectors.labelArea);

			var listArea              = '<div class="'+this.classes.listArea.substring(1)+'"></div>';
			this.selectors.listArea   = $(listArea).appendTo(this.selectors.selectArea);
			$(this.selectors.listArea).width($(this.selectors.selectArea).width()-3);

		   /**
			* If searchable
			*/
			if(this.isSearchable) {
				var searchArea            = '<div class="'+this.classes.searchArea.substring(1)+'"></div>';
				this.selectors.searchArea = $(searchArea).appendTo(this.selectors.listArea);

				var search                = '<input type="text" class="'+this.classes.search.substring(1)+'" placeholder="Search here..."/>';
				this.selectors.search     = $(search).appendTo(this.selectors.searchArea);
			}

			var list                  = '<ul class="'+this.classes.list.substring(1)+'"></ul>';
			this.selectors.list       = $(list).appendTo(this.selectors.listArea);

			if (!this.isHideButtons) {
				var operations = '<div class="'+this.classes.operations.substring(1)+'"></div>';
				this.selectors.operations = $(operations).appendTo(this.selectors.listArea);
			}

			var clear                 = '<button type="button" class="'+this.classes.clear.substring(1)+' '+this.clearClass+'">Clear</button>';
			this.selectors.clear      = $(clear).appendTo(this.selectors.operations);

			var close                 = '<button type="button" class="'+this.classes.close.substring(1)+' '+this.closeClass+'">Close</button>';
			this.selectors.close      = $(close).appendTo(this.selectors.operations);
			$(this.createList()).appendTo(this.selectors.list);
			this.fixCSS();
        },            

        setEvents : function() {
			var _self = this;
			$(this.selectors.labelArea).attr('style', $(this.selector).attr('style')).addClass($(this.selector).attr('class'));
			$(this.selectors.labelArea).click(function(e){
				e.stopPropagation();
				$this = $(this).parent().find(_self.classes.listArea);
				$(_self.classes.listArea).not($this).hide();
				$this.toggle();
			});
			$(document).click(function(e) {
				var isGroup   = $(e.target).hasClass(_self.classes.listGroup.substring(1));
				var isItem    = $(e.target).hasClass(_self.classes.listItem.substring(1));
				var isClear   = $(e.target).hasClass(_self.classes.clear.substring(1));
				var isSearch  = $(e.target).hasClass(_self.classes.search.substring(1));
				if(!isGroup && !isItem && !isClear && !isSearch) {
					$(_self.selectors.listArea).hide();
				}
			});
			$(this.selectors.close).click(function(){
				$(this).closest(_self.classes.listArea).hide(); 
			});
			$(this.selectors.list).find(this.classes.listItem).click(function(){
				$(_self.selectors.list).find(_self.classes.listItem).removeClass('active');
				$input      = $(this).find(_self.classes.inputType);
				var checked = !($input.is(':checked'));
				$input.prop('checked', checked);
				var values  = $('input[name="'+_self.name+'"]:checked').map(function(){
				    return $(this).val();
				}).get();
				if(values.length > _self.settings.limit) {
					alert('You cannot select more than '+_self.settings.limit); 
					$input.prop('checked', false);
					$(this).removeClass('active');
					return false;
				};
				_self.setValue(values);
			});
			/**
			* If searchable
			*/
			if(this.isSearchable) {
				$(this.selectors.search).keyup(function(){
					var value = $.trim($(this).val().toLowerCase());
					_self.filterList(value);
				});
			}
			$(this.selectors.clear).click(function(){
				_self.clearInputs();
			});
			$(window).resize(function(){
				$(_self.selectors.listArea).width($(_self.selectors.selectArea).width()-3);
			});
			this.loadExisting();
        },

        loadExisting : function() {
			var _self = this;
			if(this.selected.length) {
				var selected  = false;
				$(this.selectors.list).find(this.classes.listItem).each(function(){
					$input = $(this).find(_self.classes.inputType);
					var isSelected = $.inArray($input.val(), _self.selected);
					if((isSelected !== -1 && _self.isMultiple) || (isSelected !== -1 && !selected)) {
						$input.prop('checked', true);
						selected = true;
					}
				});
				this.setValue(this.selected);
			}
        },

        setValue : function(values) {
			var _self = this;
			$(this.selector).find('option').attr('selected', false);
			var label = (values.length)? '' : this.defaultLabel+', ';
			$.each(this.options, function(index, option){
				if($.inArray(option.value, values) !== -1){
					label += option.label+', ';
					$(_self.selector).find('[value="'+option.value+'"]').attr('selected', true);
					$(_self.selectors.list).find(_self.classes.inputType).each(function(){
						if($(this).is(':checked')) {
							$(this).closest(_self.classes.listItem).addClass('active');
						}
					});
					if(!_self.isMultiple) {
						return false;
					}
				}
			});
			label = (values.length >= this.settings.labelLimit)? values.length+' selected': label.slice(0, -2);
			$(this.selectors.label).text(label);
			$(this.selector).change();
			if(!_self.isMultiple) {
				$(this.selectors.listArea).hide();
			}
			if(this.settings.consoleValue) {
				console.info($(this.selector).val());
			}
        },

        toggleIcon : function() {
			if(this.settings.type === 'bootstrap') {
				return '<span class="'+this.classes.toggle.substring(1)+' fa fa-chevron-down"></span>';
			} else if(this.settings.type === 'materialize') {
				return '<i class="'+this.classes.toggle.substring(1)+' material-icons">arrow_drop_down</i>';
			} else {
				return '<span class="'+this.classes.toggle.substring(1)+'"><i class="fa-solid fa-chevron-down f-12"></i> </span>';
			}
        },

        createList : function() {
			var _self     = this;
			var listHTML  = '';
			var selected  = false;
			$.each(this.options, function(index, option){
				if(option.type === 'optgroup') {
					listHTML += '<li class="'+_self.classes.listGroup.substring(1)+'">'+option.label+'</li>';
				} else if(option.value) {
					var isActive = ((option.selected && _self.isMultiple) || (option.selected && !selected))? 'active': '';
					isActive += (_self.isOptGroup)? ' '+_self.classes.itemPad.substring(1): '';
					listHTML += '<li class="'+_self.classes.listItem.substring(1)+' '+isActive+'">'+_self.getInputType(option.value)+' '+option.label+'</li>';
					if(option.selected) {
						_self.selected.push(option.value);
						selected = true;
					}
				}
			});
			if(this.isSearchable) {
				listHTML += '<li class="'+_self.classes.noResult.substring(1)+'">No matching options</li>';
			}
			return listHTML;
        },

		getInputType : function(value) {
			var type        = (this.isMultiple)? 'checkbox': 'radio';
			var inputClass  = this.classes.inputType.substring(1);
			return '<input type="'+type+'" name="'+this.name+'" class="'+inputClass+'" value="'+value+'"/>';
		},

		filterList : function(value) {
			const _self = this;

			$(this.selectors.list).find(this.classes.noResult).hide();

			if(this.isOptGroup) {
				$(this.selectors.list).find(this.classes.listGroup).hide();
			}

			let lis = $(this.selectors.list).find(this.classes.listItem)
			let matchingLisIndices = []

			lis.each(function(index, el){
				if(el.innerText.toLowerCase().indexOf(value) !== -1) {
					matchingLisIndices.push(index)
				}
			});

			lis.each(function(index, el){
				el.style.display = 'none';
			});

			for (let i of matchingLisIndices) {
				const el = lis[i];
				el.style.display = 'list-item';
				if (_self.isOptGroup) {
					$(el).prevAll(_self.classes.listGroup + ':first').show();
				}
			}

			if(!matchingLisIndices.length) {
				$(this.selectors.list).find(this.classes.noResult).show();
			}
		},

        clearInputs : function() {
			$(this.selector).find(':selected').attr('selected', false);
			$(this.selectors.list).find(this.classes.listItem).removeClass('active');
			$(this.selectors.list).find(this.classes.inputType).prop('checked', false);
			$(this.selectors.label).text(this.defaultLabel);
			/**
			* If searchable
			*/
			if(this.isSearchable) {
				$(this.selectors.search).val('');
			}
			this.filterList('');
        },

        fixCSS : function() {
			if(this.settings.type === 'materialize') {
				$(this.selectors.labelArea).addClass(this.classes.labelMaterial.substring(1));
				$(this.selectors.searchArea).css('max-height', '46px');
				$(this.selectors.search).css('max-height', '28px');
			} else if(this.settings.type === 'bootstrap') {
				$(this.selectors.search).css('width', '100%');
			} else {
				$(this.selectors.labelArea).addClass(this.classes.labelDefault.substring(1));
			}
        },

		getSelectionAreaId : function() {
        	return this.id ? 'id="' + this.id + '"' : ''
		},

        refresh : function() {
			this._setMethod('refresh');
			this._init();
		},

		destroy : function() {
			this._setMethod('destroy');
			this._init();
		},

        checkMethod : function() {
			$findArea = $(this.selector).next(this.classes.selectArea);
			if($findArea.length) {
				$findArea.remove();
			}
			$(this.selector).show();
			return !(this.method === 'destroy')
        },

	};

	$.fn.amsifySelect = function(settings, method) {
	   /**
		* Initializing each instance of selector
		* @return {object}
		*/
		return this.each(function() {
			var amsifySelect = new AmsifySelect(this);
			amsifySelect._settings(settings);
			amsifySelect._setMethod(method);
			amsifySelect._init();
		});
	};

}));
