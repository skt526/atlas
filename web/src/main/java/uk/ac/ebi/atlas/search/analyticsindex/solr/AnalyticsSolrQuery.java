package uk.ac.ebi.atlas.search.analyticsindex.solr;

import com.google.common.base.Function;
import com.google.common.base.Joiner;
import com.google.common.collect.FluentIterable;
import com.google.common.collect.ImmutableList;
import uk.ac.ebi.atlas.search.SemanticQuery;
import uk.ac.ebi.atlas.search.SemanticQueryTerm;

import javax.annotation.Nullable;

public class AnalyticsSolrQuery {
    public enum Operator {
        AND(" AND "),
        OR(" OR ");

        private final String opString;

        Operator(String opString) {
            this.opString = opString;
        }
    }

    private abstract class TreeNode {
    }

    private class Leaf extends TreeNode {
        private String searchField;
        private SemanticQuery searchValue;

        private Leaf(String searchField, SemanticQuery searchValue) {
            this.searchField = searchField;
            this.searchValue = searchValue;
        }

        @Override
        public String toString() {

            Function<SemanticQueryTerm, String> semanticQueryTermToSolr = new Function<SemanticQueryTerm, String>() {
                @Nullable
                @Override
                public String apply(@Nullable SemanticQueryTerm semanticQueryTerm) {
                    return semanticQueryTerm.hasNoCategory()
                            ? String.format("\"%s\"", semanticQueryTerm.value())
                            : String.format("\"%s:{%s}\"", semanticQueryTerm.category(), semanticQueryTerm.value());
                }
            };

            return String.format("%s:(%s)", searchField, Joiner.on(Operator.OR.opString).join(FluentIterable.from(searchValue.terms()).transform(semanticQueryTermToSolr)));
        }
    }

    private class Parent extends TreeNode {
        private Operator operator;
        private Iterable<TreeNode> children;

        private Parent(Operator operator, Iterable<TreeNode> children) {
            this.operator = operator;
            this.children = children;
        }

        @Override
        public String toString() {
            Function<TreeNode, String> wrapParentsInParenthesis = new Function<TreeNode, String>() {
                @Nullable
                @Override
                public String apply(@Nullable TreeNode treeNode) {
                    if (treeNode instanceof Parent) {
                        return "(" + treeNode.toString() + ")";
                    } else {
                        return treeNode.toString();
                    }
                }
            };

            return Joiner.on(this.operator.opString).join(FluentIterable.from(children).transform(wrapParentsInParenthesis));
        }
    }

    private TreeNode root;

    public String toString() {
        return root.toString();
    }

    public AnalyticsSolrQuery(String searchField, SemanticQuery searchValue) {
        root = new Leaf(searchField, searchValue);
    }

    public AnalyticsSolrQuery(Operator operator, AnalyticsSolrQuery... queries) {
        ImmutableList.Builder<TreeNode> childrenBuilder = new ImmutableList.Builder<>();
        for (AnalyticsSolrQuery query : queries) {
            childrenBuilder.add(query.root);
        }

        root = new Parent(operator, childrenBuilder.build());
    }
}