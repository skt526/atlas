<%--@elvariable id="searchDescription" type="java.lang.String"--%>
<%--@elvariable id="identifier" type="java.lang.String"--%>
<%--@elvariable id="species" type="java.lang.String"--%>
<%--@elvariable id="hasBaselineResults" type="boolean"--%>
<%--@elvariable id="hasDifferentialResults" type="boolean"--%>
<%--@elvariable id="applicationProperties" type="atlas.web.ApplicationProperties"--%>

<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib tagdir="/WEB-INF/tags" prefix="h" %>

<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/css/foundation/bioentities-box.css"/>

<section>
    <h3 class="gxaSearchTermDescription">
        Results for <span class="searchterm">${searchDescription}</span>
    </h3>
</section>

<section class="gxaSection">
    <ul class="tabs" data-tabs role="tablist" id="experiments-tabs">
        <c:if test="${hasBaselineResults}"><li title="Baseline experiments" class="tabs-title is-active" role="presentation">
            <a href="${requestScope['javax.servlet.forward.request_uri']}#base" role="tab" id="baselineTabLink">Baseline expression</a></li></c:if>
        <c:if test="${!hasBaselineResults}"><li title="Baseline experiments" class="tabs-title" role="presentation">Baseline expression</li></c:if>

        <c:if test="${hasDifferentialResults}"><li title="Differential experiments" class="tabs-title" role="presentation">
            <a href="${requestScope['javax.servlet.forward.request_uri']}#diff" data-toggle="tab" id="differentialTabLink">Differential expression</a></li></c:if>
        <c:if test="${!hasDifferentialResults}"><li title="Differential experiments" class="tabs-title" role="presentation"><a href="">Differential expression</a></li></c:if>
    </ul>

    <!-- Tab panes -->
    <div class="tabs-content" data-tabs-content="experiments-tabs">
        <div role="tabpanel" class="tabs-panel is-active" id="base"><%@ include file="baseline-expression.jsp" %></div>
        <div role="tabpanel" class="tabs-panel" id="diff"><%@ include file="differential-expression.jsp" %></div>
    </div>
</section>

<script src="${pageContext.request.contextPath}/versioned-resources-${resourcesVersion}/js-bundles/vendorCommons.bundle.js"></script>
<script src="${pageContext.request.contextPath}/versioned-resources-${resourcesVersion}/js-bundles/expressionAtlasBioentityInformation.bundle.js"></script>
<script src="${pageContext.request.contextPath}/versioned-resources-${resourcesVersion}/js-bundles/expressionAtlasBaselineExpression.bundle.js"></script>
<script src="${pageContext.request.contextPath}/versioned-resources-${resourcesVersion}/js-bundles/expressionAtlasDifferentialExpression.bundle.js"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/URI.js/1.17.0/URI.min.js"></script>

<script>

    var hasBaselineResults = ${hasBaselineResults},
        hasDifferentialResults = ${hasDifferentialResults};

    var $baselineTabLink = $("#baselineTabLink"),
        $differentialTabLink = $("#differentialTabLink");

    $baselineTabLink.click(function() {
        $(".gxaContrastTooltip").add(".gxaWebpackHelpTooltip").remove();
        window.location.hash = "#baseline";
    });
    $differentialTabLink.click(function() {
        $(".gxaContrastTooltip").add(".gxaWebpackHelpTooltip").remove();
        window.location.hash = "#differential";
    });

    setInitialHash();
    showTabOnHash();

    window.addEventListener("popstate", showTabOnHash);

    function showTabOnHash() {
//        if (window.location.hash === "#baseline") {
//            $baselineTabLink.tab("show");
//        } else  {
//            $differentialTabLink.tab("show");
//        }
    }

    function setInitialHash() {
        if (window.location.hash != "#differential" && window.location.hash != "#information") {
            var hash;

            if (hasBaselineResults) {
                hash = "#baseline";
            }
            else if (hasDifferentialResults) {
                hash = "#differential";
            }

            var newURL = new URI(window.location).hash(hash);
            history.replaceState(null, "", newURL);
        }
    }

</script>
