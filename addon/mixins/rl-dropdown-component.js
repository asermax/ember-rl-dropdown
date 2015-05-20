import Ember from 'ember';

export default Ember.Mixin.create({
  dropdownExpanded: false,

  dropdownToggleSelector: '.rl-dropdown-toggle',

  dropdownSelector: '.rl-dropdown',

  clickOutEventNamespace: 'rl-dropdown',

  actions: {
    toggleDropdown: function () {
      this.toggleProperty('dropdownExpanded');
    },

    openDropdown: function () {
      this.set('dropdownExpanded', true);
    },

    closeDropdown: function () {
      this.set('dropdownExpanded', false);
    }
  },

  manageClickoutEvent: function () {
    var eventName = 'click.'+ this.get('clickOutEventNamespace');
    var component = this;
    
    if (this.get('dropdownExpanded')) {

      /* Add clickout handler with 1ms delay, to allow opening the dropdown
       * by clicking e.g. a checkbox and binding to dropdownExpanded, without
       * having the handler close the dropdown immediately. */
      Ember.run.later(function() {
        Ember.$(document).bind(eventName, {component: component}, component.clickoutHandler);
      }, 1);
    } else {
      Ember.$(document).unbind(eventName, component.clickoutHandler);
    }
  }.observes('dropdownExpanded').on('didInsertElement'),

  unbindClickoutEvent: function () {
    Ember.$(document).unbind('click.'+ this.get('clickOutEventNamespace'), this.clickoutHandler);
  }.on('willDestroyElement'),

  clickoutHandler: function (event) {
    var component = event.data.component;
    var $c = component.$();
    var $target = Ember.$(event.target);

    // There is an issue when the click triggered a dom change in the dropdown that unloaded the target element. The
    // ancestry of the target can no longer be determined. We can check if html is still an ancestor to determine
    // if this has happened. The safe option then seems to be to not close the dropdown, as occasionaly not closing
    // the dropdown when it should have closed, seems to be less bad for usability than occasionaly closing the
    // dropdown when it should not have closed.
    if(component.get('dropdownExpanded') && $target.closest('html').length !== 0 &&
      !($target.closest($c.find(component.get('dropdownToggleSelector'))).length ||
        $target.closest($c.find(component.get('dropdownSelector'))).length)
    ) {
      component.set('dropdownExpanded', false);
    }
  }
});
