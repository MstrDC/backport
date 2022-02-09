import { SourceCommitWithTargetPullRequest } from './parseSourceCommit';

export function getMockSourceCommit({
  sourceCommit,
  sourcePullRequest,
  timelineItems = [],
}: {
  sourceCommit: {
    sha?: string;
    message: string;
    commitedDate?: string;
  };
  sourcePullRequest: {
    number: number;
    labels?: string[];
    sourceBranch?: string;
  } | null;
  timelineItems?: Array<{
    state: 'OPEN' | 'CLOSED' | 'MERGED';
    targetBranch: string;
    title?: string;
    number: number;
    commitMessages: string[];
    repoName?: string;
    repoOwner?: string;
  }>;
}): SourceCommitWithTargetPullRequest {
  const defaultTargetPullRequestTitle =
    'DO NOT USE: Default Pull Request Title';
  const defaultSourceCommitSha = 'DO NOT USE: default-source-commit-sha';

  const baseMockCommit = {
    repository: {
      name: 'kibana',
      owner: { login: 'elastic' },
    },
    committedDate: sourceCommit.commitedDate ?? '2021-12-22T00:00:00Z',
    sha: sourceCommit.sha ?? defaultSourceCommitSha,
    message: sourceCommit.message,
  };

  if (!sourcePullRequest) {
    return {
      ...baseMockCommit,
      associatedPullRequests: {
        edges: null,
      },
    };
  }

  return {
    repository: {
      name: 'kibana',
      owner: { login: 'elastic' },
    },
    committedDate: sourceCommit.commitedDate ?? '2021-12-22T00:00:00Z',
    sha: sourceCommit.sha ?? defaultSourceCommitSha,
    message: sourceCommit.message,
    associatedPullRequests: {
      edges: [
        {
          node: {
            mergeCommit: {
              sha: sourceCommit.sha ?? defaultSourceCommitSha,
              message: sourceCommit.message,
            },
            url: `https://github.com/elastic/kibana/pull/${sourcePullRequest.number}`,
            labels: {
              nodes: (sourcePullRequest.labels ?? []).map((name) => ({
                name,
              })),
            },
            baseRefName:
              sourcePullRequest.sourceBranch ??
              'source-branch-from-associated-pull-request',
            number: sourcePullRequest.number,
            timelineItems: {
              edges: timelineItems.map((timelineItem) => {
                return {
                  node: {
                    targetPullRequest: {
                      __typename: 'PullRequest',
                      url: `https://github.com/elastic/kibana/pull/${timelineItem.number}`,
                      title:
                        timelineItem.title ?? defaultTargetPullRequestTitle,
                      number: timelineItem.number,
                      state: timelineItem.state,
                      baseRefName: timelineItem.targetBranch,

                      targetMergeCommit:
                        timelineItem.state === 'MERGED'
                          ? {
                              message: timelineItem.commitMessages[0],
                              sha: 'target-merge-commit-sha',
                            }
                          : null,

                      repository: {
                        name: timelineItem.repoName ?? 'kibana',
                        owner: {
                          login: timelineItem.repoOwner ?? 'elastic',
                        },
                      },
                      commits: {
                        edges: timelineItem.commitMessages.map((message) => ({
                          node: {
                            targetCommit: {
                              sha: 'abc',
                              message: message,
                            },
                          },
                        })),
                      },
                    },
                  },
                };
              }),
            },
          },
        },
      ],
    },
  };
}