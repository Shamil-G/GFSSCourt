export const TabConfig = {
  pretrial: {
    url: orderNum => `/pretrial_fragment?order_num=${orderNum}`,
    zoneSelector: '#pretrialContent'
  },
  scammer: {
    url: orderNum => `/scammer_fragment?order_num=${orderNum}`,
    zoneSelector: '#scammerContent'
  },
  law: {
    url: orderNum => `/law_fragment?order_num=${orderNum}`,
    zoneSelector: '#lawContent'
  },
  court_crime: {
    url: orderNum => `/court_crime_fragment?order_num=${orderNum}`,
    zoneSelector: '#court_crimeContent'
  },
  court_civ: {
    url: orderNum => `/court_civ_fragment?order_num=${orderNum}`,
    zoneSelector: '#court_civContent'
  },
  appeal: {
    url: orderNum => `/appeal_fragment?order_num=${orderNum}`,
    zoneSelector: '#appealContent'
  },
  execution: {
    url: orderNum => `/execution_fragment?order_num=${orderNum}`,
    zoneSelector: '#executionContent'
  },
  refunding: {
    url: orderNum => `/refunding_fragment?order_num=${orderNum}`,
    zoneSelector: '#refundingContent'
  }
};
