import React, { createContext, useContext, useState } from 'react';
import ErrorPopup from './error';

const ErrorContext = createContext({});

export const useError = () => useContext(ErrorContext);

export const ErrorProvider = ({ children }) => {
  const [modalProps, setModalProps] = useState({
    isVisible: false,
    content: null,
  });

  const showError = (content) => {
    setModalProps({ isVisible: true, content });
  };

  const hideError = () => {
    setModalProps({ isVisible: false, content: null });
  };

  return (
    <ErrorContext.Provider value={{ showError, hideError }}>
      {children}
      <ErrorPopup {...modalProps} handleClose={hideError} />
    </ErrorContext.Provider>
  );
};
