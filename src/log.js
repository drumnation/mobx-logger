import { padStart, now } from "./utils";
import Reactotron from "reactotron-react-js";

const style = (color, bold = true) => {
  return `color:${color};font-weight:${bold ? "600" : "300"};font-size:11px`;
};

const defaultLoggerConfig = {
  disable: false,
  functions: {}
};

const getLoggerConfig = ev => {
  if (ev.object == null) {
    return defaultLoggerConfig;
  }
  const loggerConfig = ev.object.constructor.mobxLoggerConfig;
  return loggerConfig == null ? defaultLoggerConfig : loggerConfig;
};

const isLoggingEnabled = ev => {
  if (ev.object == null) {
    return false;
  }
  const loggerConfig = getLoggerConfig(ev);
  if (loggerConfig == null) {
    return true;
  }
  const enabled = loggerConfig.enabled === true || loggerConfig.enabled == null;
  if (loggerConfig.methods == null) {
    return enabled;
  }
  const propertyName = getPropName(ev);
  const methodLoggerConfig = loggerConfig.methods[propertyName];
  if (methodLoggerConfig == null) {
    return enabled;
  }
  if (methodLoggerConfig === true) {
    return true;
  }
  if (methodLoggerConfig === false) {
    return false;
  }
  return methodLoggerConfig.enabled !== false;
};

const logAction = ev => {
  if (!isLoggingEnabled(ev)) {
    return;
  }
  Reactotron.display({
    name: padStart("ACTION", 8),
    preview: ev,
    value: {
      function: ev.fn,
      arguments: ev.arguments,
      event: ev,
      target: ev.object,
      time: now
    }
  });
  // console.groupCollapsed(
  //   "%c%s  %s  %s.%s()",
  //   style("#000"),
  //   now(),
  //   padStart("ACTION", 8),
  //   ev.object.name || ev.object,
  //   ev.name
  // );
  // console.log("%cFunction %o", style("#777"), ev.fn);
  // console.log("%cArguments %o", style("#777"), ev.arguments);
  // console.log("%cTarget %o", style("#777"), ev.object);
  // console.log("%cEvent %o", style("#777"), ev);
  // console.groupEnd();
};

const logReaction = ev => {
  const name = ev.object.name.replace("#null", "");
  // console.groupCollapsed(
  //   "%c%s  %s  %s",
  //   style("#9E9E9E"),
  //   now(),
  //   padStart("REACTION", 8),
  //   name
  // );

  const observables = ev.object.observing || [];
  const names = observables.map(it => it.name);
  // if (names.length > 0) {
  //   console.log("%cObserving %o", style("#777"), names);
  // }

  // console.log("%cEvent %o", style("#777"), ev);
  // console.groupEnd();
  Reactotron.display({
    name: 'REACTION',
    preview: `Observing ${names || name}`,
    value: {
      event: ev,
      name: names || name,
      time: now
    }
  })
};

const logTransaction = ev => {
  // console.groupCollapsed(
  //   "%c%s  %s  %s",
  //   style("#7B7B7B"),
  //   now(),
  //   padStart("TX", 8),
  //   ev.name
  // );
  // console.log("%cEvent %o", style("#777"), ev);
  // console.groupEnd();
  Reactotron.display({
    name: 'TRANSACTION',
    preview: ev.name,
    value: {
      event: ev,
      time: now
    }
  })
};

const logCompute = ev => {
  if (!isLoggingEnabled(ev)) {
    return;
  }
  const name = ev.object;
  let propName = getPropName(ev);
  if (propName) {
    propName = `.${propName}`;
  }
  // console.groupCollapsed(
  //   "%c%s  %s  %s%s",
  //   style("#9E9E9E"),
  //   now(),
  //   padStart("COMPUTE", 8),
  //   name,
  //   propName
  // );
  // console.log("%cEvent %o", style("#777"), ev);
  // console.groupEnd();
  Reactotron.display({
    name: 'COMPUTE',
    preview: `Compute ${name} - ${propName}`,
    value: {
      event: ev,
      time: now
    }
  })
};

const getPropName = ev => {
  if (ev.name != null) {
    return ev.name;
  }
  return (
    Object.keys(ev.object.$mobx.values).filter(
      key => ev.object.$mobx.values[key].derivation === ev.fn
    )[0] || ""
  );
};

export default (ev, options) => {
  if (options[ev.type] !== true) {
    return;
  }

  switch (ev.type) {
    case "action":
      logAction(ev);
      return;
    case "reaction":
      logReaction(ev);
      return;
    case "transaction":
      logTransaction(ev);
      return;
    case "compute":
      logCompute(ev);
      return;
  }
};
