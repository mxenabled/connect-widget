import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { AttentionFilled } from "@kyper/icon/AttentionFilled";
import { useTokens } from "@kyper/tokenprovider";
import { Text } from "@kyper/text";

import { isRunningE2ETests } from "src/connect/utilities/e2e";
import { PageviewInfo } from "src/connect/const/Analytics";

export const GenericError = ({
  loadError,
  onAnalyticPageview,
  subtitle,
  title,
}) => {
  const tokens = useTokens();
  const styles = getStyles(tokens);

  useEffect(() => {
    if (!isRunningE2ETests())
      onAnalyticPageview(
        loadError?.status === 404
          ? "/connect" + PageviewInfo.CONNECT_NOT_FOUND_ERROR[1]
          : "/connect" + PageviewInfo.CONNECT_GENERIC_ERROR[1],
        {
          error_message: title,
          error_status: loadError?.status || null,
          resource: loadError?.resource || null,
        }
      );
  }, []);

  return (
    <div style={styles.container}>
      <AttentionFilled
        color={tokens.TextColor.Default}
        height={48}
        styles={styles.icon}
        width={48}
      />
      <Text as="H2" tag="h1">
        {title}
      </Text>
      {subtitle && (
        <Text as="Paragraph" tag="h2">
          {subtitle}
        </Text>
      )}
    </div>
  );
};

function getStyles(tokens) {
  return {
    container: {
      backgroundColor: tokens.BackgroundColor.Container,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      height: "100%",
      padding: tokens.Spacing.XSMALL,
      textAlign: "center",
    },
    icon: {
      marginBottom: tokens.Spacing.XLarge,
    },
  };
}

GenericError.propTypes = {
  loadError: PropTypes.object,
  onAnalyticPageview: PropTypes.func.isRequired,
  subtitle: PropTypes.string,
  title: PropTypes.string.isRequired,
};
